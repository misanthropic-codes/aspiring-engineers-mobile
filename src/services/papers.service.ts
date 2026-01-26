/**
 * Papers Service - Aspiring Engineers Mobile
 *
 * Handles PYQ (Previous Year Questions) papers API calls.
 * Supports both with-solution and without-solution papers.
 */

import { api } from "./api.client";

// Paper categories
export type PaperCategory = "jee-main" | "jee-advanced" | "wbjee" | "neet";

// Paper interface
export interface Paper {
  _id: string;
  category: PaperCategory;
  year: number;
  title: string;
  type: string;
  thumbnailUrl?: string;
  paperDriveLink: string;
  solutionDriveLink?: string;
  videoSolutionLink?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// API Response interface
export interface PapersResponse {
  data: Paper[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Category display info
export interface CategoryInfo {
  id: PaperCategory;
  name: string;
  shortName: string;
  color: string;
}

export const PAPER_CATEGORIES: CategoryInfo[] = [
  { id: "jee-main", name: "JEE Main", shortName: "Main", color: "#2596be" },
  {
    id: "jee-advanced",
    name: "JEE Advanced",
    shortName: "Advanced",
    color: "#4EA8DE",
  },
  { id: "neet", name: "NEET", shortName: "NEET", color: "#22C55E" },
  { id: "wbjee", name: "WBJEE", shortName: "WBJEE", color: "#F59E0B" },
];

export const papersService = {
  /**
   * Get papers with solutions
   * @param category - Optional category filter
   * @returns Array of papers with solutions
   */
  getPapersWithSolution: async (category?: PaperCategory): Promise<Paper[]> => {
    try {
      const response = await api.get<PapersResponse>("/papers/with-solution");
      let papers = response.data || [];

      // Filter by category if provided
      if (category) {
        papers = papers.filter((paper) => paper.category === category);
      }

      // Sort by display order
      return papers.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.error("Error fetching papers with solution:", error);
      return [];
    }
  },

  /**
   * Get papers without solutions (practice papers)
   * @param category - Optional category filter
   * @returns Array of papers without solutions
   */
  getPapersNoSolution: async (category?: PaperCategory): Promise<Paper[]> => {
    try {
      const response = await api.get<PapersResponse>("/papers/no-solution");
      let papers = response.data || [];

      // Filter by category if provided
      if (category) {
        papers = papers.filter((paper) => paper.category === category);
      }

      // Sort by display order
      return papers.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.error("Error fetching papers without solution:", error);
      return [];
    }
  },

  /**
   * Get combined stats for papers
   * @param papers - Array of papers to analyze
   * @returns Stats object with counts
   */
  getStats: (papers: Paper[]) => {
    if (!papers.length) {
      return {
        totalPapers: 0,
        yearsRange: "N/A",
        withSolutions: 0,
        withVideo: 0,
      };
    }

    const years = papers.map((p) => p.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return {
      totalPapers: papers.length,
      yearsRange:
        minYear === maxYear ? `${minYear}` : `${minYear} - ${maxYear}`,
      withSolutions: papers.filter((p) => p.solutionDriveLink).length,
      withVideo: papers.filter((p) => p.videoSolutionLink).length,
    };
  },

  /**
   * Get category info by ID
   * @param categoryId - Category ID
   * @returns Category info or undefined
   */
  getCategoryInfo: (categoryId: PaperCategory): CategoryInfo | undefined => {
    return PAPER_CATEGORIES.find((c) => c.id === categoryId);
  },
};

export default papersService;
