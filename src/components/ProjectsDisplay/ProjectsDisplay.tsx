import React, { useState, useEffect } from "react";
// import ProjectGrid from "../ProjectGrid/ProjectGrid";
import { ProjectService } from "../../services/ProjectService";
import { IProjectSummary } from "../../interfaces/IProject";
import { useAuth } from "../../context/AuthContext";
import AddProject from "../AddProject/AddProject";
import {SearchItems, DDItems} from "@asafarim/shared";
import "./ProjectsDisplay.css";
import { PaginatedProjectGrid } from "@asafarim/paginated-project-grid";
import { useTheme } from "@asafarim/react-themes";
import { useNavigate } from "react-router-dom";

interface ProjectsDisplayProps {
  showUserProjectsOnly?: boolean;
  title?: string;
  showAddButton?: boolean;
}

const ProjectsDisplay: React.FC<ProjectsDisplayProps> = ({
  showUserProjectsOnly = false,
  title = "Projects",
  showAddButton = false,
}) => {
  const { isAuthenticated, user, token } = useAuth();
  const [projects, setProjects] = useState<IProjectSummary[]>([]);
  const [_totalCount, setTotalCount] = useState(0);
  const [_currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);

  const { currentTheme } = useTheme();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showPublicOnly, setShowPublicOnly] = useState<boolean | undefined>(
    undefined
  );
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean | undefined>(
    undefined
  );

  const navigate = useNavigate();

  const loadProjects = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    // Debug authentication state
    console.log("ProjectsDisplay Debug:");
    console.log("- showUserProjectsOnly:", showUserProjectsOnly);
    console.log("- isAuthenticated:", isAuthenticated);
    console.log("- user:", user);
    console.log("- token:", token ? "exists" : "null");
    console.log("- Loading projects for page:", page);

    try {
      let result;

      if (showUserProjectsOnly) {
        if (!isAuthenticated || !user?.id) {
          setError(
            "Authentication required. Please log in to access this feature."
          );
          setProjects([]);
          setTotalCount(0);
          setIsLoading(false);
          return;
        }
        // Use getProjects with userId filter instead of getUserProjects
        result = await ProjectService.getProjects(
          page,
          pageSize,
          searchTerm || undefined,
          statusFilter || undefined,
          undefined, // isPublic
          undefined, // isFeatured
          user.id // userId
        );
        console.log("User projects result-1:", result?.data);
        if (result.success && result.data) {
          // Handle both paginated response and direct array response
          const projectsArray = Array.isArray(result.data)
            ? result.data
            : result.data.items || [];
          const totalCount = Array.isArray(result.data)
            ? result.data.length
            : result.data.totalCount || 0;
          const pageNumber = Array.isArray(result.data)
            ? 1
            : result.data.pageNumber || 1;

          setProjects(projectsArray);
          setTotalCount(totalCount);
          setCurrentPage(pageNumber);
        }
      } else {
        result = await ProjectService.getProjects(
          page,
          pageSize,
          searchTerm || undefined,
          statusFilter || undefined,
          showPublicOnly,
          showFeaturedOnly
        );
        console.log("All projects result:", result);
        if (result.success && result.data) {
          // Handle both paginated response and direct array response
          const projectsArray = Array.isArray(result.data)
            ? result.data
            : result.data.items || [];
          const totalCount = Array.isArray(result.data)
            ? result.data.length
            : result.data.totalCount || 0;
          const pageNumber = Array.isArray(result.data)
            ? 1
            : result.data.pageNumber || 1;

          setProjects(projectsArray);
          setTotalCount(totalCount);
          setCurrentPage(pageNumber);
        }
      }
    } catch (error) {
      setError("An unexpected error occurred while loading projects");
      setProjects([]);
      setTotalCount(0);
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("ProjectsDisplay useEffect");
    console.log("Projects:", projects);
  }, [projects]);

  useEffect(() => {
    // Only load projects if we're not showing user projects, or if we are and user is authenticated
    if (
      !showUserProjectsOnly ||
      (showUserProjectsOnly && isAuthenticated && user?.id)
    ) {
      loadProjects(1);
    }
  }, [
    searchTerm,
    statusFilter,
    showPublicOnly,
    showFeaturedOnly,
    showUserProjectsOnly,
    isAuthenticated,
    user?.id,
  ]);

  const handleProjectAdded = () => {
    setShowAddProject(false);
    loadProjects(1); // Reload first page
  };

  if (showAddProject) {
    return (
      <AddProject
        onProjectAdded={handleProjectAdded}
        key={"add-project"}
        onCancel={() => setShowAddProject(false)}
      />
    );
  }

  return (
    <div className="projects-display">
      <div className="projects-header">
        <h1>{title}</h1>
        {showAddButton && isAuthenticated && (
          <button
            className="btn-add-project"
            onClick={() => setShowAddProject(true)}
          >
            Add Project
          </button>
        )}
      </div>

      <div className="projects-filters">
        <SearchItems
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search projects..."
          searchType="minimal"
        />

        <DDItems
          selectedValue={statusFilter}
          onValueChange={setStatusFilter}
          items={[
            { value: "", label: "All Statuses" },
            { value: "Planning", label: "Planning" },
            { value: "In Progress", label: "In Progress" },
            { value: "Completed", label: "Completed" },
            { value: "On Hold", label: "On Hold" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
          dropdownType="minimal"
        />

        {!showUserProjectsOnly && (
          <>
            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showPublicOnly === true}
                  onChange={(e) =>
                    setShowPublicOnly(e.target.checked ? true : undefined)
                  }
                />
                Public Only
              </label>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly === true}
                  onChange={(e) =>
                    setShowFeaturedOnly(e.target.checked ? true : undefined)
                  }
                />
                Featured Only
              </label>
            </div>
          </>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Wrap PaginatedProjectGrid in error boundary */}
      {(() => {
        try {
          const transformedProjects =
            (projects && Array.isArray(projects) ? projects : [])
              ?.filter((p) => p && typeof p === "object") // Filter out null/undefined projects
              ?.map((p) => {
                console.log("Transforming project:", p.id, p);
                // Map status to expected enum values
                let mappedStatus:
                  | "active"
                  | "archived"
                  | "in-progress"
                  | undefined;
                switch (p.status?.toLowerCase()) {
                  case "completed":
                    mappedStatus = "archived";
                    break;
                  case "in progress":
                  case "planning":
                    mappedStatus = "in-progress";
                    break;
                  case "active":
                    mappedStatus = "active";
                    break;
                  default:
                    mappedStatus = "in-progress";
                }

                const transformedProject = {
                  id: p.id || "",
                  title: p.title || "Untitled Project",
                  description: p.description || "",
                  status: mappedStatus,
                  priority: p.priority || "Medium",
                  progress: typeof p.progress === "number" ? p.progress : 0,
                  tags: Array.isArray(p.tags) ? p.tags : [],
                  thumbnailUrl: p.thumbnailUrl || "",
                  image: p.image || p.thumbnailUrl || "",
                  createdAt: p.createdAt || new Date().toISOString(),
                  updatedAt: p.updatedAt || new Date().toISOString(),
                  userId: p.userId || p.userUsername || "",
                  author: p.userUsername || "Unknown Author",
                  isPublic: Boolean(p.isPublic),
                  isFeatured: Boolean(p.isFeatured),
                  featured: Boolean(p.isFeatured), // Alternative property name
                  isActive: Boolean(p.isActive),
                  isDeleted: Boolean(p.isDeleted),
                  repositoriesCount:
                    typeof p.repositoriesCount === "number"
                      ? p.repositoriesCount
                      : 0,
                  projectsCount:
                    typeof p.projectsCount === "number" ? p.projectsCount : 0,
                  lastUpdated: p.updatedAt || new Date().toISOString(),
                  // Use techStack (singular) as expected by ProjectCard component
                  techStack: Array.isArray(p.techStackIds)
                    ? p.techStackIds.map((id) => ({
                        name:
                          (Array.isArray(p.techStacks)
                            ? p.techStacks.find((ts) => ts.id === id)?.name
                            : null) || "Unknown",
                        icon:
                          (Array.isArray(p.techStacks)
                            ? p.techStacks.find((ts) => ts.id === id)?.icon
                            : null) || "",
                        color:
                          (Array.isArray(p.techStacks)
                            ? p.techStacks.find((ts) => ts.id === id)?.color
                            : null) || "#666666",
                      }))
                    : [],
                  // Also provide techStacks for compatibility
                  techStacks: Array.isArray(p.techStackIds)
                    ? p.techStackIds.map((id) => ({
                        id: id || "",
                        name:
                          (Array.isArray(p.techStacks)
                            ? p.techStacks.find((ts) => ts.id === id)?.name
                            : null) || "Unknown",
                        icon:
                          (Array.isArray(p.techStacks)
                            ? p.techStacks.find((ts) => ts.id === id)?.icon
                            : null) || "",
                        color:
                          (Array.isArray(p.techStacks)
                            ? p.techStacks.find((ts) => ts.id === id)?.color
                            : null) || "#666666",
                      }))
                    : [],
                  links: [
                    ...(p.repositoryUrl
                      ? [
                          {
                            type: "repo" as const,
                            url: p.repositoryUrl,
                            label: "Repository",
                          },
                        ]
                      : []),
                    ...(p.liveUrl
                      ? [
                          {
                            type: "demo" as const,
                            url: p.liveUrl,
                            label: "Live Demo",
                          },
                        ]
                      : []),
                  ],
                };

                console.log(
                  "Transformed project:",
                  transformedProject.id,
                  transformedProject
                );
                return transformedProject;
              }) || [];

          console.log("Final transformed projects array:", transformedProjects);

          return (
            <PaginatedProjectGrid
              key={"asafarim-projects-grid"}
              projects={transformedProjects}
              cardsPerPage={6}
              currentTheme={currentTheme.mode}
              enableSearch={false}
              showTechStackIcons={true}
              onProjectClick={(project: any) => {
                console.log("Clicked project:", project.title);
                navigate(`/projects/${project.id}`);
              }}
            />
          );
        } catch (error) {
          console.error("Error rendering PaginatedProjectGrid:", error);
          return (
            <div className="error-message">
              Error displaying projects grid. Please check the console for
              details.
            </div>
          );
        }
      })()}

      {/* Commented out for testing PaginatedProjectGrid
      <ProjectGrid
        projects={projects || []}
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / pageSize)}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        itemsPerPage={pageSize}
      />
      */}

      {!isLoading && projects && projects.length === 0 && !error && (
        <div className="no-projects">
          <p>No projects found.</p>
          {showAddButton && isAuthenticated && (
            <button
              className="btn-add-first-project"
              onClick={() => setShowAddProject(true)}
            >
              Add your first project
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsDisplay;
