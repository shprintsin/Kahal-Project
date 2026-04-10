import { AdminPageBlock } from "@/components/admin/admin-page-block";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

interface CreateAdminPageConfig<T = any> {
  titleKey: string;
  descriptionKey?: string;
  getData: () => Promise<T>;
  Component: React.ComponentType<any>;
  dataPropName?: string;
  componentProps?: Record<string, any>;
  createNewLink?: string;
  action?: React.ReactNode;
}

export function createAdminPage<T = any>(config: CreateAdminPageConfig<T>) {
  return async function AdminPage() {
    const data = await config.getData();
    const {
      Component,
      titleKey,
      descriptionKey,
      dataPropName = 'data',
      componentProps = {},
      createNewLink,
      action: configAction
    } = config;

    // Load translations
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "he";
    const t = await getTranslations({ locale });

    // Create props object with custom data prop name
    const props = {
      ...componentProps,
      [dataPropName]: data,
    };

    const action = configAction || (createNewLink ? (
      <Link href={createNewLink}>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('buttons.new')}
        </Button>
      </Link>
    ) : undefined);

    return (
      <AdminPageBlock
        title={t(titleKey as any)}
        description={descriptionKey ? t(descriptionKey as any) : undefined}
        action={action}
      >
        <Component {...props} />
      </AdminPageBlock>
    );
  };
}
