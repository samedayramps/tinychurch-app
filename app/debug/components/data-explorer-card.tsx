import { DatabaseIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Database } from "@/database.types";
import { ScrollArea } from "@/components/ui/scroll-area";

type TableData = {
  [K in keyof Database['public']['Tables']]: Database['public']['Tables'][K]['Row'][];
};

interface DataExplorerCardProps {
  data: Partial<TableData>;
  className?: string;
}

function formatValue(value: any): string {
  if (value === null) return '—';
  if (value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function DataExplorerCard({ data, className }: DataExplorerCardProps) {
  const tables = Object.entries(data);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DatabaseIcon size={16} />
          <CardTitle className="text-lg">Data Explorer</CardTitle>
        </div>
        <CardDescription>View database tables you have access to</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={tables[0]?.[0]} className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-2">
            {tables.map(([tableName]) => (
              <TabsTrigger key={tableName} value={tableName} className="capitalize">
                {tableName.replace(/_/g, ' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          {tables.map(([tableName, records]) => (
            <TabsContent key={tableName} value={tableName}>
              <div className="rounded-md border">
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {records && records[0] && 
                          Object.keys(records[0]).map((column) => (
                            <TableHead key={column} className="capitalize whitespace-nowrap">
                              {column.replace(/_/g, ' ')}
                            </TableHead>
                          ))
                        }
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records?.map((record, i) => (
                        <TableRow key={i}>
                          {Object.values(record).map((value, j) => (
                            <TableCell key={j} className="whitespace-nowrap">
                              {formatValue(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 