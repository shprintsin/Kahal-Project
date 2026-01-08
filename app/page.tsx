import HomePageComponent from "@/app/components/pages_components/HomePage";
import {
  actionItems,
  authorsMockData,
  citationInfoMockData,
  footerItems,
  HomeCategories,
  heroText,
  postsMockData,
  sourcesMockData,
} from "@/app/Data";

export default function HomePage() {
  return (
    <HomePageComponent
      heroText={heroText}
      actionItems={actionItems}
      categories={HomeCategories}
      footerItems={footerItems}
      posts={postsMockData}
      sources={sourcesMockData}
      authors={authorsMockData}
      citationInfo={citationInfoMockData}
    />
  );
}
