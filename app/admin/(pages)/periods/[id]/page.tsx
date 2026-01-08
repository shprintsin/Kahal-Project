import { notFound } from "next/navigation";
import { getPeriod } from "@/app/admin/actions/periods";
import { PeriodEditor } from "@/app/admin/dialogs/period-dialog";

interface PeriodPageProps {
  params: Promise<{ id: string }>;
}

export default async function PeriodPage({ params }: PeriodPageProps) {
  const { id } = await params;

  let period = null;

  try {
    if (id !== "new") {
      period = await getPeriod(id);
    }
  } catch (error) {
    if (id !== "new") {
      notFound();
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{period ? "Edit Period" : "Create Period"}</h2>
        <p className="text-muted-foreground">{period ? `Editing "${period.slug}"` : "Create a new period"}</p>
      </div>

      <PeriodEditor period={period} />
    </div>
  );
}
