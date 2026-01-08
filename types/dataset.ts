
// src\app\components\pages_components\HomePage.tsx

/**
 * ------------------------------------------------------------------
 * ENUMS & TYPES
 * Define the allowed values to prevent "magic strings" and errors.
 * ------------------------------------------------------------------
 */

// Supported file formats for research downloads
export type FileFormat = 
  | 'CSV' 
  | 'JSON' 
  | 'XLSX' 
  | 'MD' 
  | 'STATA' // .dta files (common in econometrics)
  | 'SPSS'  // .sav files
  | 'GEOJSON' 
  | 'JSON' 
  | 'PDF' 
  | 'TXT';

// Standard licenses for open research data
export enum LicenseType {
  CC0 = 'CC0-1.0',             // Public Domain
  CC_BY = 'CC-BY-4.0',         // Attribution required
  CC_BY_SA = 'CC-BY-SA-4.0',   // Attribution + ShareAlike
  RESTRICTED = 'RESTRICTED',   // Requires specific permission
}

// Status to let users know if data is safe to use

// Data types for specific columns (used in the Codebook)
export type VariableType = 'string' | 'integer' | 'float' | 'date' | 'boolean' | 'categorical';
export type DataStatus = 
  | 'draft'     
  | 'published' 
  | 'archived'  
  
// 2. Data Maturity: How much should I trust this?
export type DataMaturity = 
  | 'raw'          
  | 'provisional'  
  | 'verified'     
  | 'experimental';

/**
 * ------------------------------------------------------------------
 * SUB-INTERFACES
 * Helper structures for Files and Codebooks.
 * ------------------------------------------------------------------
 */

/**
 * Represents a single downloadable file within the dataset.
 * (e.g., The raw scan, the cleaned Excel, or the Stata file).
 */
export interface DataResource {
  id: string;
  name: string;             // e.g. "Census 1764 - Cleaned Data"
  url: string;              // Link to storage (S3/Blob)
  format: FileFormat;
  size_bytes?: number;      // e.g. 1048576 (for displaying "1MB")
  row_count?: number;       // e.g. 15,000 records
  is_main_file: boolean;    // If true, highlight this as the primary download
}

/**
 * Represents a specific column/variable in the data.
 * Allows the UI to generate an interactive "Data Dictionary" table.
 */
export interface DataVariable {
  name: string;             // The actual column header (e.g., "rel_stat")
  label: string;            // Human-readable name (e.g., "Religious Status")
  description?: string;     // Methodology notes (e.g., "Based on tax records...")
  type: VariableType;
  
  // For categorical data: maps codes to meanings.
  // Example: { "1": "Jewish", "2": "Catholic", "99": "Unknown" }
  values?: Record<string, string>; 
}


/**
 * ------------------------------------------------------------------
 * MAIN INTERFACE
 * The core Dataset object.
 * ------------------------------------------------------------------
 */

/**
 * Generic Interface for a Research Dataset.
 * T = The shape of the actual data rows (optional, defaults to any).
 */
export interface ResearchDataset<T = any> {
  // --- Identity ---
  id: string;
  slug: string;                  // Friendly URL (e.g., 'krakow-census-1764')
  title: string;
  
  // --- Metadata ---
  description: string;           // Short abstract
  category: string;              // e.g., "Demographics", "Taxation"
  tags: string[];                // e.g., ["Galicia", "18th Century", "Vital Records"]
  status: DataStatus;
  maturity: DataMaturity,
  
  // --- Versioning & Dates ---
  version: string;               // e.g., "1.2.0"
  created_at: Date;              // Record creation date
  last_updated: Date;            // Last modification date
  
  // --- Research Specifics ---
  temporal_coverage?: {          // The historical period the data covers
    start_year: number;
    end_year: number;
  };
  geographic_coverage?: string;  // Region name or Coordinates
  citation_text?: string;        // Pre-formatted citation for researchers
  license?: LicenseType;
  
  // --- Codebook / Documentation ---
  codebook_url?: string;         // Link to external PDF/Doc documentation
  codebook_text?: string;        // Markdown/HTML for general notes/methodology
  variables_schema?: DataVariable[]; // Structured definition of columns
  
  // --- The Data Content ---
  resources: DataResource[];     // Array of downloadable files
  preview_data?: T[];            // A snippet of the data for the UI table (e.g., top 5 rows)
}