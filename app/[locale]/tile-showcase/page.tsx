'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Eye, AlertCircle } from 'lucide-react';
import { MaturityBadge, PublishStatusBadge } from '@/components/ui/status-badge';
import { SectionTitle } from '@/components/ui/typography';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

const mock = {
  title: 'מרכזי קהילות יהודיות בפולין-ליטא, 1765',
  category: 'דמוגרפיה',
  status: 'published' as const,
  maturity: 'verified' as const,
  version: '2.1.0',
  last_updated: new Date('2025-01-10'),
  temporal_coverage: { start_year: 1764, end_year: 1765 },
  geographic_coverage: 'פולין-ליטא (חבר העמים)',
  license: 'CC-BY-4.0',
  description: `# תיאור המאגר\n\nמאגר זה מכיל נתונים על מרכזי קהילות יהודיות (קהלים) בפולין-ליטא בשנת 1765, מבוסס על רישומי מס הגולגולת.\n\n## מקורות\n\n- רישומי מס הגולגולת, ארכיון המדינה בוורשה\n- מפקד אוכלוסין 1764-1765\n\n## מבנה הנתונים\n\nכל רשומה מייצגת קהילה יהודית אחת, עם מיקום גיאוגרפי, מספר נפשות, וסכום מס.\n\n| עמודה | תיאור |\n|---|---|\n| name | שם הקהילה |\n| lat | קו רוחב |\n| lon | קו אורך |\n| population | מספר נפשות |\n| tax_amount | סכום מס בזלוטי |`,
  codebook_text: `# מילון נתונים\n\n| שם העמודה | סוג | תיאור |\n|---|---|---|\n| id | integer | מזהה ייחודי |\n| name | string | שם הקהילה |\n| lat | float | קו רוחב |\n| lon | float | קו אורך |\n| population | integer | מספר נפשות רשומות |\n| tax_amount | float | סכום מס שנתי בזלוטי |`,
  resources: [
    { id: '1', name: 'נתוני קהילות - CSV', format: 'CSV', size: '240.0 KB', url: '/storage/datasets/12345_kahal_centers_1765.csv' },
    { id: '2', name: 'נתוני קהילות - GeoJSON', format: 'GEOJSON', size: '500.0 KB', url: '/storage/datasets/12345_kahal_centers_1765.geojson' },
  ],
};

function useMarkdown(text: string) {
  const [html, setHtml] = useState('');
  useEffect(() => {
    unified()
      .use(remarkParse).use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw).use(rehypeStringify)
      .process(text)
      .then((file) => setHtml(String(file)))
      .catch(() => setHtml(text));
  }, [text]);
  return html;
}

function TitleBlock() {
  return (
    <div className="mb-6 text-right">
      <a href="#" className="text-brand-primary text-sm mb-2 font-semibold uppercase tracking-wide hover:underline inline-block">{mock.category}</a>
      <SectionTitle className="mb-0 text-3xl sm:text-4xl leading-tight">{mock.title}</SectionTitle>
    </div>
  );
}

function ContentBlock({ descHtml, codebookHtml }: { descHtml: string; codebookHtml: string }) {
  const [tab, setTab] = useState('description');
  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 shadow-sm border border-border">
      <Tabs value={tab} onValueChange={setTab} dir="rtl">
        <TabsList className="bg-muted mb-4">
          <TabsTrigger value="description" className="text-sm px-4 data-[state=active]:bg-white">תיאור המאגר</TabsTrigger>
          <TabsTrigger value="codebook" className="text-sm px-4 data-[state=active]:bg-white">מילון נתונים (Codebook)</TabsTrigger>
        </TabsList>
        <TabsContent value="description">
          <div className="markdown-content pt-4" dir="rtl" dangerouslySetInnerHTML={{ __html: descHtml }} />
        </TabsContent>
        <TabsContent value="codebook">
          <div className="markdown-content pt-4" dir="rtl" dangerouslySetInnerHTML={{ __html: codebookHtml }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResourcesBlock() {
  return (
    <div className="bg-white p-5 border border-border shadow-sm">
      <h4 className="text-sm font-bold text-foreground mb-3 font-display">קבצי נתונים</h4>
      <div className="space-y-3">
        {mock.resources.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-border-strong shadow-sm">
            <div className="text-brand-primary"><FileSpreadsheet className="w-5 h-5" /></div>
            <div className="flex-1 text-right min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-foreground mb-1">{r.name}</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground font-mono truncate" dir="ltr">{r.url.split('/').pop()?.replace(/^\d+_/, '')}</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{r.format} • {r.size}</div>
            </div>
            <div className="flex items-center gap-1">
              {r.format === 'CSV' && (
                <button className="p-2 text-muted-foreground hover:text-brand-primary transition-colors" title="צפה בנתונים">
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <a href={r.url} download className="p-2 text-muted-foreground hover:text-brand-primary transition-colors" title="הורד">
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBlock() {
  return (
    <div className="bg-white p-4 border border-border shadow-sm">
      <a href="#" className="flex items-center gap-2 text-xs text-body-secondary hover:text-brand-primary transition-colors justify-center py-1">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>מצאת טעות? דווח לנו</span>
      </a>
    </div>
  );
}

function MetadataVertical() {
  return (
    <div className="bg-white p-5 border border-border shadow-sm">
      <dl className="space-y-3 text-right">
        <div className="flex flex-col gap-1 pb-3 border-b border-border">
          <dt className="text-xs font-semibold text-body font-display">סטטוס</dt>
          <dd className="flex gap-2 flex-wrap">
            <PublishStatusBadge status={mock.status} />
            <MaturityBadge maturity={mock.maturity} />
          </dd>
        </div>
        <div className="flex flex-col gap-1 pb-3 border-b border-border">
          <dt className="text-xs font-semibold text-body font-display">תקופה</dt>
          <dd className="text-sm text-foreground font-medium">{mock.temporal_coverage.start_year} - {mock.temporal_coverage.end_year}</dd>
        </div>
        <div className="flex flex-col gap-1 pb-3 border-b border-border">
          <dt className="text-xs font-semibold text-body font-display">אזור גיאוגרפי</dt>
          <dd className="text-sm text-foreground">{mock.geographic_coverage}</dd>
        </div>
        <div className="flex flex-col gap-1 pb-3 border-b border-border">
          <dt className="text-xs font-semibold text-body font-display">גרסה</dt>
          <dd className="text-sm text-foreground font-mono">{mock.version}</dd>
        </div>
        <div className="flex flex-col gap-1 pb-3 border-b border-border">
          <dt className="text-xs font-semibold text-body font-display">רישיון</dt>
          <dd className="text-sm text-foreground font-mono">{mock.license}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-semibold text-body font-display">עדכון אחרון</dt>
          <dd className="text-sm text-foreground">{mock.last_updated.toLocaleDateString('he-IL')}</dd>
        </div>
      </dl>
    </div>
  );
}

function MetadataGrid() {
  return (
    <div className="bg-white p-5 border border-border shadow-sm">
      <div className="flex gap-2 flex-wrap mb-4">
        <PublishStatusBadge status={mock.status} />
        <MaturityBadge maturity={mock.maturity} />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-right">
        <div>
          <div className="text-[11px] text-muted-foreground font-semibold">תקופה</div>
          <div className="text-sm text-foreground font-medium">{mock.temporal_coverage.start_year}-{mock.temporal_coverage.end_year}</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground font-semibold">אזור גיאוגרפי</div>
          <div className="text-sm text-foreground">{mock.geographic_coverage}</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground font-semibold">גרסה</div>
          <div className="text-sm text-foreground font-mono">{mock.version}</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground font-semibold">רישיון</div>
          <div className="text-sm text-foreground font-mono">{mock.license}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[11px] text-muted-foreground font-semibold">עדכון אחרון</div>
          <div className="text-sm text-foreground">{mock.last_updated.toLocaleDateString('he-IL')}</div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ metadata }: { metadata: 'vertical' | 'grid' }) {
  return (
    <div className="flex flex-col gap-4">
      {metadata === 'vertical' ? <MetadataVertical /> : <MetadataGrid />}
      <ResourcesBlock />
      <ErrorBlock />
    </div>
  );
}

export default function TileShowcasePage() {
  const descHtml = useMarkdown(mock.description);
  const codebookHtml = useMarkdown(mock.codebook_text);

  return (
    <div className="min-h-screen bg-gray-100 py-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">השוואת פריסות עמוד מאגר</h1>
        <p className="text-muted-foreground mb-16">4 וריאציות: A/A2 × סרגל צד ימין/שמאל</p>

        {/* === 1: A (vertical) + sidebar RIGHT (RTL: first in DOM) === */}
        <section className="mb-20">
          <h2 className="text-xl font-bold mb-1">1. מטאדאטה אנכית (A) — סרגל צד בימין</h2>
          <p className="text-xs text-muted-foreground mb-6">בעמוד RTL, סרגל הצד מופיע בצד ימין (צד הקריאה)</p>
          <div className="border-2 border-dashed border-border/50 p-4 sm:p-6 bg-white/50">
            <TitleBlock />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6">
              <Sidebar metadata="vertical" />
              <ContentBlock descHtml={descHtml} codebookHtml={codebookHtml} />
            </div>
          </div>
        </section>

        {/* === 2: A (vertical) + sidebar LEFT (RTL: last in DOM) === */}
        <section className="mb-20">
          <h2 className="text-xl font-bold mb-1">2. מטאדאטה אנכית (A) — סרגל צד בשמאל</h2>
          <p className="text-xs text-muted-foreground mb-6">בעמוד RTL, סרגל הצד מופיע בצד שמאל</p>
          <div className="border-2 border-dashed border-border/50 p-4 sm:p-6 bg-white/50">
            <TitleBlock />
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
              <ContentBlock descHtml={descHtml} codebookHtml={codebookHtml} />
              <Sidebar metadata="vertical" />
            </div>
          </div>
        </section>

        {/* === 3: A2 (grid) + sidebar RIGHT (RTL: first in DOM) === */}
        <section className="mb-20">
          <h2 className="text-xl font-bold mb-1">3. מטאדאטה דו-עמודית (A2) — סרגל צד בימין</h2>
          <p className="text-xs text-muted-foreground mb-6">בעמוד RTL, סרגל הצד מופיע בצד ימין (צד הקריאה)</p>
          <div className="border-2 border-dashed border-border/50 p-4 sm:p-6 bg-white/50">
            <TitleBlock />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6">
              <Sidebar metadata="grid" />
              <ContentBlock descHtml={descHtml} codebookHtml={codebookHtml} />
            </div>
          </div>
        </section>

        {/* === 4: A2 (grid) + sidebar LEFT (RTL: last in DOM) === */}
        <section className="mb-20">
          <h2 className="text-xl font-bold mb-1">4. מטאדאטה דו-עמודית (A2) — סרגל צד בשמאל</h2>
          <p className="text-xs text-muted-foreground mb-6">בעמוד RTL, סרגל הצד מופיע בצד שמאל</p>
          <div className="border-2 border-dashed border-border/50 p-4 sm:p-6 bg-white/50">
            <TitleBlock />
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
              <ContentBlock descHtml={descHtml} codebookHtml={codebookHtml} />
              <Sidebar metadata="grid" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
