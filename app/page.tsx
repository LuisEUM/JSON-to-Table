import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonTable } from "./table/json-table"
import { sampleData } from "./data/sample-data"

export default function JsonAnalyzerPage() {
  return (
    <div className="py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>JSON Type Analyzer</CardTitle>
        </CardHeader>
        <JsonTable data={sampleData} />
      </Card>
    </div>
  )
}

