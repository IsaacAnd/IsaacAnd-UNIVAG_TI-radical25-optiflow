'use client';
import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DemandsChart } from '@/components/dashboard/demands-chart';
import { UrgentTasks } from '@/components/dashboard/urgent-tasks';
//a

export default function Home() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <MainSidebar currentPage="dashboard" />
      <SidebarInset className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
          <StatsCards />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <DemandsChart />
            </div>
            <div className="lg:col-span-2">
              <UrgentTasks />
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}
