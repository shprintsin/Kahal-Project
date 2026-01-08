**Task:** Create a `DatasetLandingPage` component based on the specifications below.

#### 1. Context & Design Aesthetic

The application is a historical research portal for Jewish communities. The design should feel "Academic" and "Modern"
I want to create My data section in this site, the data section is a place where user can download datasets,
the data page should use mine style language, that is: rectangle boxes with littlebit shadow, , not rounded edges, visible title section,etc
you can see the implemetation in the components of: src\app\components\pages_components\HomePage.tsx (after the hero section)

#### 2. Data Structure (Schema)

Use the following TypeScript interfaces for this file: src\types\dataset.ts

#### 3. Layout Specification

The page should be a vertical stack with a specific grid layout for the main content.

**A. Page Header (Top):**

- Render the `dataset.title` as a large `<h1>`. use <SectionTitle> component for that
- Show `dataset.category` as a subtle kicker above the title.

**B. The "Info & Action" Grid (Middle Section):**

- **Layout:** A 2-column grid. The Left column is 2/3 width, Right column is 1/3 width.
- **Left Column (Metadata Container):**
- Style: A light grey background container (`bg-gray-50` or similar), distinct from the white page.
- Content: A Description List (`<dl>`) displaying key-value pairs:
- **Status:** Render `status` and `maturity` as colored badges (e.g., Green for "Verified", Yellow for "Provisional").
- **Time Period:** `start_year` - `end_year`.
- **Last Updated:** Format the date.
- **License:** Display the license type.

- **Right Column (The Sidebar):**
- **Section 1: Downloads:**
- Header: "Data Files".
- List: Iterate through `dataset.resources`.
- For each file, render a button with a relevant File Icon (use Lucide-React or similar) based on `resource.format`, the filename, and the file size.

- **Section 2: Documentation:**
- Header: "Documentation".
- Action: If `codebook_url` exists, render a link/button: "View Codebook / Variables".

- **Section 3: Feedback (Bottom):**
- Place this at the very bottom of the column.
- Link text: "מצאת טעות? דווח לנו" (Found an error? Report to us).

**C. The Description Row (Bottom Section):**

- **Layout:** Full width, located immediately _after_ the Grid section.
- **Content:** Render `dataset.description`.
- **Note:** This field contains long-form text. Ensure it has proper typography spacing (prose) for readability.

#### 4. Requirements

- Use **Tailwind CSS** for styling.
- Use the site Design language
- Use **Lucide React** (or generic placeholders) for icons: `FileSpreadsheet` for Excel/CSV, `FileJson` for JSON, `BookOpen` for Codebook, `AlertCircle` for Report Error.
- Ensure the "Download" buttons look clickable and prominent.
- Handle empty states (e.g., if no temporal coverage is provided, don't show the row).

**Output:** write app/data/{dataset} page and its component (in component folder)

Mockupdata is here: mockupdataset.ts
use it in similiar way for how you have query database
