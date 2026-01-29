/**
 * Papers Service - Aspiring Engineers Mobile
 *
 * Handles PYQ (Previous Year Questions) papers API calls.
 * Supports both with-solution and without-solution papers.
 */

import { api } from "./api.client";

// Paper categories
export type PaperCategory =
  | "jee-main"
  | "jee-advanced"
  | "wbjee"
  | "neet"
  | "boards-10"
  | "boards-12"
  | "sample-10"
  | "sample-12";

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
  { id: "jee-main", name: "JEE Main", shortName: "JEE Main", color: "#2596be" },
  {
    id: "jee-advanced",
    name: "JEE Advanced",
    shortName: "JEE Adv",
    color: "#4EA8DE",
  },
  { id: "neet", name: "NEET", shortName: "NEET", color: "#22C55E" },
  { id: "wbjee", name: "WBJEE", shortName: "WBJEE", color: "#F59E0B" },
  { id: "boards-10", name: "Class 10 Boards", shortName: "Class 10", color: "#8E44AD" },
  { id: "boards-12", name: "Class 12 Boards", shortName: "Class 12", color: "#9B59B6" },
  { id: "sample-10", name: "Class 10 Sample", shortName: "Sample 10", color: "#E67E22" },
  { id: "sample-12", name: "Class 12 Sample", shortName: "Sample 12", color: "#D35400" },
];

export const papersService = {
  /**
   * Get papers with solutions
   * @param category - Optional category filter
   * @returns Array of papers with solutions
   */
  /**
   * Get papers (unified)
   * @param params - Query parameters
   * @returns Array of papers
   */
  getPapers: async (params: { category?: PaperCategory; solution?: boolean }): Promise<Paper[]> => {
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append("category", params.category);
      
      const response = await api.get<PapersResponse | Paper[]>(`/papers?${queryParams.toString()}`);
      
      let papers: Paper[] = [];
      
      if (Array.isArray(response)) {
        papers = response;
      } else if (response && 'data' in response) {
        // It's PapersResponse
        papers = response.data || [];
      }

      // Filter for solutions if specifically requested by the method wrapper
      if (params.solution === true) {
         papers = papers.filter((p: Paper) => p.solutionDriveLink || p.videoSolutionLink);
      }

      return papers.sort((a: Paper, b: Paper) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.error("Error fetching papers:", error);
      return [];
    }
  },

  /**
   * Get papers with solutions
   * @param category - Optional category filter
   * @returns Array of papers with solutions
   */
  getPapersWithSolution: async (category?: PaperCategory): Promise<Paper[]> => {
    return papersService.getPapers({ category, solution: true });
  },

  /**
   * Get papers without solutions (practice papers)
   * @param category - Optional category filter
   * @returns Array of papers without solutions
   */
  getPapersNoSolution: async (category?: PaperCategory): Promise<Paper[]> => {
     // For "no solution" / practice, we might just return all papers for the category
     // allowing the user to practice them. Or strictly those without solutions.
     // In the web app, we mapped everything to `getPapers`.
     return papersService.getPapers({ category });
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
