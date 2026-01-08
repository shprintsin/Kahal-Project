'use client';

import React, { useState, useEffect } from 'react';
import { ResearchDataset } from '@/types/dataset';
import { SectionTitle } from '../layout/ui/Components';
import { FileSpreadsheet, FileJson, BookOpen, AlertCircle, FileText, Download } from 'lucide-react';
import { Col } from '../StyledComponent';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import Header from '../layout/header/Header';
import GlobalFooter from '../layout/GlobalFooter';
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface DatasetLandingPageProps {
  dataset: ResearchDataset;
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

const getMaturityBadge = (maturity: string) => {
  const badges = {
    verified: { label: 'מאומת', color: 'bg-green-100 text-green-800 border-green-400' },
    provisional: { label: 'זמני', color: 'bg-yellow-100 text-yellow-800 border-yellow-400' },
    raw: { label: 'גולמי', color: 'bg-gray-100 text-gray-800 border-gray-400' },
    experimental: { label: 'ניסיוני', color: 'bg-orange-100 text-orange-800 border-orange-400' }
  };
  const badge = badges[maturity as keyof typeof badges] || badges.raw;
  return (
    <span className={`px-3 py-1.5 text-sm font-semibold border-2 ${badge.color}`}>
      {badge.label}
    </span>
  );
};

const getStatusBadge = (status: string) => {
  const badges = {
    published: { label: 'פורסם', color: 'bg-green-100 text-green-800 border-green-400' },
    draft: { label: 'טיוטה', color: 'bg-gray-100 text-gray-800 border-gray-400' },
    archived: { label: 'מאורכב', color: 'bg-blue-100 text-blue-800 border-blue-400' }
  };
  const badge = badges[status as keyof typeof badges] || badges.draft;
  return (
    <span className={`px-3 py-1.5 text-sm font-semibold border-2 ${badge.color}`}>
      {badge.label}
    </span>
  );
};

export default function DatasetLandingPage({ dataset }: DatasetLandingPageProps) {
  const [descriptionHtml, setDescriptionHtml] = useState<string>('');
  const [codebookHtml, setCodebookHtml] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('description');

  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const file = await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkRehype)
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
            .use(remarkRehype)
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
    // Scroll to tabs section
    setTimeout(() => {
      document.getElementById('content-tabs')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <Header navigation={navigation} />
      
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-10 text-right">
          <p className="text-emerald-700 text-base mb-3 font-semibold uppercase tracking-wide">{dataset.category}</p>
          <SectionTitle className="mb-0 text-5xl leading-tight">{dataset.title}</SectionTitle>
        </div>

        {/* Info & Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Metadata (2/3 width) */}
          <div className="lg:col-span-2 bg-white p-8 shadow-sm border border-gray-200">
            <dl className="space-y-4 text-right">
              {/* Status */}
              <div className="flex flex-col gap-2 pb-4 border-b border-gray-200">
                <dt className="text-sm font-semibold text-gray-700 secular">סטטוס</dt>
                <dd className="flex gap-3 flex-wrap">
                  {getStatusBadge(dataset.status)}
                  {getMaturityBadge(dataset.maturity)}
                </dd>
              </div>

              {/* Time Period */}
              {dataset.temporal_coverage && (
                <div className="flex flex-col gap-2 pb-4 border-b border-gray-200">
                  <dt className="text-sm font-semibold text-gray-700 secular">תקופה</dt>
                  <dd className="text-gray-900 text-base font-medium">
                    {dataset.temporal_coverage.start_year} - {dataset.temporal_coverage.end_year}
                  </dd>
                </div>
              )}

              {/* Geographic Coverage */}
              {dataset.geographic_coverage && (
                <div className="flex flex-col gap-2 pb-4 border-b border-gray-200">
                  <dt className="text-sm font-semibold text-gray-700 secular">אזור גיאוגרפי</dt>
                  <dd className="text-gray-900 text-base">{dataset.geographic_coverage}</dd>
                </div>
              )}

              {/* Last Updated */}
              <div className="flex flex-col gap-2 pb-4 border-b border-gray-200">
                <dt className="text-sm font-semibold text-gray-700 secular">עדכון אחרון</dt>
                <dd className="text-gray-900 text-base">
                  {new Date(dataset.last_updated).toLocaleDateString('he-IL')}
                </dd>
              </div>

              {/* Version */}
              <div className="flex flex-col gap-2 pb-4 border-b border-gray-200">
                <dt className="text-sm font-semibold text-gray-700 secular">גרסה</dt>
                <dd className="text-gray-900 text-base font-mono">{dataset.version}</dd>
              </div>

              {/* License */}
              {dataset.license && (
                <div className="flex flex-col gap-2">
                  <dt className="text-sm font-semibold text-gray-700 secular">רישיון</dt>
                  <dd className="text-gray-900 text-base font-mono">{dataset.license}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Right Column - Sidebar (1/3 width) */}
          <Col className="gap-6">
            {/* Downloads Section */}
            <div className="bg-white p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-5 secular text-right">קבצי נתונים</h3>
              <div className="space-y-3">
                {dataset.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-300 shadow-sm hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
                    download
                  >
                    <div className="text-emerald-700 group-hover:text-emerald-800">
                      {getFileIcon(resource.format)}
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-base font-semibold text-gray-900 mb-1">{resource.name}</div>
                      <div className="text-sm text-gray-500">
                        {resource.format} {resource.size_bytes && `• ${formatFileSize(resource.size_bytes)}`}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Documentation Section */}
            {(dataset.codebook_url || dataset.codebook_text) && (
              <div className="bg-white p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-5 secular text-right">תיעוד</h3>
                <a
                  href="#codebook"
                  onClick={handleCodebookClick}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-300 shadow-sm hover:border-emerald-600 hover:bg-emerald-50 transition-all"
                >
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <span className="text-base font-semibold text-gray-900">צפה בקודבוק / משתנים</span>
                </a>
              </div>
            )}

            {/* Feedback Section */}
            <div className="bg-white p-4 shadow-sm border border-gray-200 mt-auto">
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 transition-colors justify-center"
              >
                <AlertCircle className="w-4 h-4" />
                <span>מצאת טעות? דווח לנו</span>
              </a>
            </div>
          </Col>
        </div>

        {/* Description Section with Tabs - Full Width */}
        <div id="content-tabs" className="bg-white p-10 shadow-sm border border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="bg-gray-100 mb-6">
              <TabsTrigger value="description" className="text-base px-6 data-[state=active]:bg-white">
                תיאור המאגר
              </TabsTrigger>
              {dataset.codebook_text && (
                <TabsTrigger value="codebook" className="text-base px-6 data-[state=active]:bg-white">
                  קודבוק ומשתנים
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="description">
              <div 
                className="prose prose-lg max-w-none text-right leading-relaxed" 
                dir="rtl"
                style={{ 
                  fontSize: '16px',
                  lineHeight: '1.8',
                  fontFamily: '"Assistant", "Heebo", sans-serif'
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              </div>
            </TabsContent>
            
            {dataset.codebook_text && (
              <TabsContent value="codebook">
                <div 
                  className="prose prose-lg max-w-none text-right leading-relaxed" 
                  dir="rtl"
                  style={{ 
                    fontSize: '16px',
                    lineHeight: '1.8',
                    fontFamily: '"Assistant", "Heebo", sans-serif'
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: codebookHtml }} />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </main>
    
    <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
  </div>
  );
}
