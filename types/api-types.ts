
export interface LocalizedString {
    [key: string]: string;
}

export interface Media {
    id: string;
    filename: string;
    url: string;
    altTextI18n?: LocalizedString;
}

export interface Category {
    id: string;
    title: string;
    slug: string;
    titleI18n: LocalizedString;
    thumbnail?: Media;
}

export interface Tag {
    id: string;
    slug: string;
    name: string;
    nameI18n: LocalizedString;
}

export interface Region {
    id: string;
    slug: string;
    name: string;
    nameI18n?: LocalizedString;
}

export interface User {
    id: string;
    name?: string;
    image?: string;
    role: 'ADMIN' | 'EDITOR' | 'CONTRIBUTOR';
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    status: 'draft' | 'published' | 'archived';
    language: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    author?: User;
    thumbnail?: Media;
    categories: Category[];
    tags: Tag[];
    regions: Region[];
}

export interface Page {
    id: string;
    title: string;
    slug: string;
    content?: string;
    template?: string;
    status: 'draft' | 'published' | 'archived';
    menuOrder: number;
    showInMenu: boolean;
    parentId?: string | null;
    children?: Page[];
    thumbnail?: Media;
}

export interface DatasetResource {
    id: string;
    name: string;
    slug: string;
    url: string;
    filename: string;
    mimeType: string;
    format: string;
    isMainFile: boolean;
    excerpt?: string;
    createdAt: string;
}

export interface ResearchDataset {
    id: string;
    title: string;
    slug: string;
    description?: string;
    status: string;
    maturity: string;
    version?: string;
    minYear?: number;
    maxYear?: number;
    license?: string;
    citationText?: string;
    codebookText?: string;
    sources?: string;
    category?: Category;
    regions?: Region[];
    thumbnail?: Media;
    resources?: DatasetResource[];
    resourceCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface MapLayer {
    id: string;
    name: string;
    description?: string;
    type: 'POINTS' | 'POLYGONS' | 'POLYLINES' | 'MULTI_POLYGONS' | 'RASTER';
    sourceType?: 'url' | 'database' | 'inline';
    sourceUrl?: string;
    geoJsonData?: any;
    downloadUrl?: string;
    filename?: string;
    styleConfig: any;
    interactionConfig?: any;
    isVisible: boolean;
    isVisibleByDefault: boolean;
    zIndex: number;
    createdAt: string;
    updatedAt: string;
}

export interface Map {
    id: string;
    slug: string;
    title: string;
    description?: string;
    status: string;
    version?: string;
    year?: number;
    period?: string;
    yearMin?: number;
    yearMax?: number;
    config?: any;
    globalStyleConfig?: any;
    referenceLinks?: any;
    category?: Category;
    regions?: Region[];
    tags?: Tag[];
    thumbnail?: Media;
    layers?: MapLayer[];
    resources?: DatasetResource[];
    layerCount?: number;
    resourceCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface APIResponse<T> {
    data: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface Layer {
    id: string;
    slug: string;
    name: string;
    description?: string;
    status: string;
    type: string;
    sourceType: string;
    sourceUrl?: string;
    downloadUrl?: string;
    geoJsonData?: any;
    minYear?: number;
    maxYear?: number;
    category?: Category;
    tags?: Tag[];
    regions?: Region[];
    createdAt: string;
    updatedAt: string;
    _count?: {
        maps: number;
    };
}
