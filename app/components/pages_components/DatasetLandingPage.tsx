'use client';

import React, { useState, useEffect } from 'react';
import { ResearchDataset } from '@/types/dataset';
import { SectionTitle } from '@/components/ui/typography';
import { FileSpreadsheet, FileJson, BookOpen, AlertCircle, FileText, Download, Eye } from 'lucide-react';
import { CsvViewerDialog } from '@/app/admin/components/content/csv-viewer-dialog';
import { Col } from '@/components/ui/flex';
import { MaturityBadge, PublishStatusBadge } from '@/components/ui/status-badge';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { SiteShell } from '@/components/ui/site-shell';
import type { SiteShellData } from '@/app/lib/get-navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/i18n/language-provider';
import { getDateLocale, getDir } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';

interface DatasetLandingPageProps {
  dataset: ResearchDataset;
  shellData: SiteShellData;
  locale?: string;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const getFileIcon = (format: string) => {
  switch (format.toUpperCase()) {
    case 'XLSX':
    case 'CSV':
      return <FileSpreadsheet className="w-5 h-5" />;
    case 'JSON':
    case 'GEOJSON':
      return <FileJson className="w-5 h-5" />;
    case 'PDF':
    case 'TXT':
    case 'MD':
      return <FileText className="w-5 h-5" />;
    default:
      return <Download className="w-5 h-5" />;
  }
};

export default function DatasetLandingPage({ dataset, shellData, locale: localeProp }: DatasetLandingPageProps) {
  const { locale, t } = useLanguage();
  const dir = getDir(locale as Locale);
  const dateLocale = getDateLocale(locale as Locale);
  const [descriptionHtml, setDescriptionHtml] = useState<string>('');
  const [codebookHtml, setCodebookHtml] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('description');
  const [csvPreview, setCsvPreview] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const file = await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeRaw)
          .use(rehypeStringify)
          .process(dataset.description);
        setDescriptionHtml(String(file));
      } catch (err) {
        console.error('Error processing markdown:', err);
        setDescriptionHtml(dataset.description);
      }
    };
    processMarkdown();
  }, [dataset.description]);

  useEffect(() => {
    if (dataset.codebook_text) {
      const processCodebook = async () => {
        try {
          const file = await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeRaw)
            .use(rehypeStringify)
            .process(dataset.codebook_text);
          setCodebookHtml(String(file));
        } catch (err) {
          console.error('Error processing codebook:', err);
          setCodebookHtml(dataset.codebook_text || '');
        }
      };
      processCodebook();
    }
  }, [dataset.codebook_text]);

  const handleCodebookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab('codebook');
    setTimeout(() => {
      document.getElementById('content-tabs')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <SiteShell {...shellData} locale={localeProp}>
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <div className="mb-6 sm:mb-10 text-right">
            <p className="text-brand-primary text-sm sm:text-base mb-2 sm:mb-3 font-semibold uppercase tracking-wide">{dataset.category}</p>
            <SectionTitle className="mb-0 text-3xl sm:text-4xl lg:text-5xl leading-tight">{dataset.title}</SectionTitle>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div className="lg:col-span-2 bg-white p-4 sm:p-6 lg:p-8 shadow-sm border border-border">
              <dl className="space-y-4 text-right">
                <div className="flex flex-col gap-2 pb-4 border-b border-border">
                  <dt className="text-sm font-semibold text-body font-display">{t('public.datasets.status', 'סטטוס')}</dt>
                  <dd className="flex gap-3 flex-wrap">
                    <PublishStatusBadge status={dataset.status} />
                    <MaturityBadge maturity={dataset.maturity} />
                  </dd>
                </div>

                {dataset.temporal_coverage && (
                  <div className="flex flex-col gap-2 pb-4 border-b border-border">
                    <dt className="text-sm font-semibold text-body font-display">{t('public.datasets.period', 'תקופה')}</dt>
                    <dd className="text-foreground text-base font-medium">
                      {dataset.temporal_coverage.start_year} - {dataset.temporal_coverage.end_year}
                    </dd>
                  </div>
                )}

                {dataset.geographic_coverage && (
                  <div className="flex flex-col gap-2 pb-4 border-b border-border">
                    <dt className="text-sm font-semibold text-body font-display">{t('public.datasets.geographicArea', 'אזור גיאוגרפי')}</dt>
                    <dd className="text-foreground text-base">{dataset.geographic_coverage}</dd>
                  </div>
                )}

                <div className="flex flex-col gap-2 pb-4 border-b border-border">
                  <dt className="text-sm font-semibold text-body font-display">{t('public.datasets.lastUpdated', 'עדכון אחרון')}</dt>
                  <dd className="text-foreground text-base">
                    {new Date(dataset.last_updated).toLocaleDateString(dateLocale)}
                  </dd>
                </div>

                <div className="flex flex-col gap-2 pb-4 border-b border-border">
                  <dt className="text-sm font-semibold text-body font-display">גרסה</dt>
                  <dd className="text-foreground text-base font-mono">{dataset.version}</dd>
                </div>

                {dataset.license && (
                  <div className="flex flex-col gap-2">
                    <dt className="text-sm font-semibold text-body font-display">רישיון</dt>
                    <dd className="text-foreground text-base font-mono">{dataset.license}</dd>
                  </div>
                )}
              </dl>
            </div>

            <Col className="gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 shadow-sm border border-border">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-5 font-display">{t('public.datasets.resources', 'קבצי נתונים')}</h3>
                <div className="space-y-3">
                  {dataset.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-border-strong shadow-sm group"
                    >
                      <div className="text-brand-primary">
                        {getFileIcon(resource.format)}
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-xs sm:text-sm font-semibold text-foreground mb-1">{resource.name}</div>
                        <div className="text-[11px] sm:text-xs text-muted-foreground font-mono truncate" dir="ltr">{resource.url.split('/').pop()}</div>
                        <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                          {resource.format}{resource.size_bytes > 0 ? ` • ${formatFileSize(resource.size_bytes)}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {resource.format?.toUpperCase() === 'CSV' && (
                          <button
                            onClick={() => setCsvPreview({ url: resource.url, name: resource.name })}
                            className="p-2 text-muted-foreground hover:text-brand-primary transition-colors"
                            title="צפה בנתונים"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <a
                          href={resource.url}
                          download
                          className="p-2 text-muted-foreground hover:text-brand-primary transition-colors"
                          title="הורד"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(dataset.codebook_url || dataset.codebook_text) && (
                <div className="bg-white p-4 sm:p-6 shadow-sm border border-border">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-5 font-display">{t('public.datasets.codebook', 'מילון נתונים (Codebook)')}</h3>
                  <a
                    href="#codebook"
                    onClick={handleCodebookClick}
                    className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-border-strong shadow-sm hover:border-brand-primary hover:bg-brand-primary-light transition-all"
                  >
                    <BookOpen className="w-5 h-5 text-brand-primary" />
                    <span className="text-sm sm:text-base font-semibold text-foreground">{t('public.datasets.viewCodebook', 'צפה במילון הנתונים')}</span>
                  </a>
                </div>
              )}

              <div className="bg-white p-4 shadow-sm border border-border mt-auto">
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-body-secondary hover:text-brand-primary transition-colors justify-center"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>מצאת טעות? דווח לנו</span>
                </a>
              </div>
            </Col>
          </div>

          <div id="content-tabs" className="bg-white p-4 sm:p-6 lg:p-10 shadow-sm border border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab} dir={dir}>
              <TabsList className="bg-muted mb-4 sm:mb-6">
                <TabsTrigger value="description" className="text-sm sm:text-base px-4 sm:px-6 data-[state=active]:bg-white">
                  {t('public.datasets.description', 'תיאור המאגר')}
                </TabsTrigger>
                {dataset.codebook_text && (
                  <TabsTrigger value="codebook" className="text-sm sm:text-base px-4 sm:px-6 data-[state=active]:bg-white">
                    {t('public.datasets.codebook', 'מילון נתונים (Codebook)')}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="description">
                <div className="markdown-content pt-4" dir="rtl" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              </TabsContent>

              {dataset.codebook_text && (
                <TabsContent value="codebook">
                  <div className="markdown-content pt-4" dir="rtl" dangerouslySetInnerHTML={{ __html: codebookHtml }} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </main>

      {csvPreview && (
        <CsvViewerDialog
          open={!!csvPreview}
          onOpenChange={(open) => { if (!open) setCsvPreview(null); }}
          url={csvPreview.url}
          name={csvPreview.name}
        />
      )}
    </SiteShell>
  );
}
