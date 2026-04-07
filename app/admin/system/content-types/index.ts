/**
 * Content Types Barrel Export
 *
 * Import this file to register all content types with the registry.
 */

// Import all content types to register them
import "./article";
import "./post";
import "./page-model";
import "./period";
import "./place";
import "./artifact-category";
import "./site-link";
import "./dataset";
import "./layer";
import "./category";
import "./tag";
import "./region";

// Re-export for direct access
export { ArticleType } from "./article";
export { PostType } from "./post";
export { PageType } from "./page-model";
export { CategoryType } from "./category";
export { TagType } from "./tag";
export { PeriodType } from "./period";
export { PlaceType } from "./place";
export { ArtifactCategoryType } from "./artifact-category";
export { SiteLinkType } from "./site-link";
export { DatasetType } from "./dataset";
export { LayerType } from "./layer";
export { RegionType } from "./region";
