import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResponsibleCount {
  name: string;
  subcategory: string;
  count: number;
}

interface ResponsibleCountsViewProps {
  responsibleCounts: ResponsibleCount[];
}

export default function ResponsibleCountsView({
  responsibleCounts,
}: ResponsibleCountsViewProps) {
  // Agrupar por responsable
  const groupedByResponsible = responsibleCounts.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = [];
    }
    acc[item.name].push(item);
    return acc;
  }, {} as Record<string, ResponsibleCount[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Responsables por Subcategoría</CardTitle>
        <CardDescription>
          Distribución de responsables por cada tipo de servicio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[400px] pr-4'>
          {Object.entries(groupedByResponsible).map(([responsible, counts]) => (
            <div key={responsible} className='mb-6'>
              <h3 className='text-lg font-semibold mb-2'>{responsible}</h3>
              <div className='space-y-2'>
                {counts.map((item) => (
                  <div
                    key={`${item.name}-${item.subcategory}`}
                    className='flex justify-between items-center bg-muted p-2 rounded-md'
                  >
                    <span className='text-sm font-medium'>
                      {item.subcategory}
                    </span>
                    <span className='text-sm'>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
