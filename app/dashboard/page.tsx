import { Omnibar } from "@/components/dashboard/Omnibar"
import { DashboardGrid } from "@/components/dashboard/DashboardGrid"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 md:py-12">
      <div className="flex w-full max-w-3xl flex-col items-center gap-10">
        <div className="flex w-full flex-col items-center gap-2">
          <Omnibar />
        </div>
        <div className="w-full max-w-4xl">
          <DashboardGrid />
        </div>
      </div>
    </div>
  )
}
