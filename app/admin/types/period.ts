export interface Period {
  id: string;
  slug: string;
  // Prisma returns JSON here; accept anything to match Prisma.Period
  name?: any;
  name_i18n?: any;
  dateStart?: Date | string | null;
  dateEnd?: Date | string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PeriodEditorProps {
  period: Period | null;
}
