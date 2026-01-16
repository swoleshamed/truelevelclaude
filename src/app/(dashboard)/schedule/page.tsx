// ===========================================
// FILE: src/app/(dashboard)/schedule/page.tsx
// PURPOSE: Schedule page with calendar and list views
// PRD REFERENCE: PRD Section 8 - Visit Scheduling
// ===========================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card, Button, Modal, Tabs } from '@/components/ui';
import { ScheduleCalendar } from '@/components/dashboard/ScheduleCalendar';
import { ScheduleList } from '@/components/dashboard/ScheduleList';
import { ScheduleForm, ScheduleFormData } from '@/components/forms/ScheduleForm';
import { FAB } from '@/components/layout';

interface Site {
  id: string;
  name: string;
  organizationName?: string;
}

interface ScheduledVisit {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  site: {
    id: string;
    name: string;
    organization?: {
      id: string;
      name: string;
    };
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  completedVisitLog?: {
    id: string;
    visitDate: string;
  } | null;
}

interface ReminderData {
  summary: {
    overdueCount: number;
    dueSoonCount: number;
    upcomingCount: number;
    scheduledCount: number;
  };
  overdue: any[];
  dueSoon: any[];
}

/**
 * Schedule Page
 *
 * WHY: Central hub for managing scheduled visits.
 * Provides both calendar and list views with filtering.
 *
 * FEATURES:
 * - Calendar view with month navigation
 * - List view with status filtering
 * - Create/edit/complete/cancel schedules
 * - Reminder alerts for overdue visits
 * - Role-based site access
 */
export default function SchedulePage() {
  const { data: session, status } = useSession();
  const [schedules, setSchedules] = useState<ScheduledVisit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [reminders, setReminders] = useState<ReminderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledVisit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Fetch schedules and sites
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch schedules, sites, and reminders in parallel
      const [schedulesRes, sitesRes, remindersRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/sites'),
        fetch('/api/schedules/reminders'),
      ]);

      if (schedulesRes.ok) {
        const data = await schedulesRes.json();
        setSchedules(data.schedules || []);
      }

      if (sitesRes.ok) {
        const data = await sitesRes.json();
        const siteList = (data.sites || data || []).map((site: any) => ({
          id: site.id,
          name: site.name,
          organizationName: site.organization?.name,
        }));
        setSites(siteList);
      }

      if (remindersRes.ok) {
        const data = await remindersRes.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session, fetchData]);

  /**
   * Handle schedule creation
   */
  const handleCreateSchedule = async (data: ScheduleFormData) => {
    try {
      setIsSubmitting(true);

      let endpoint = '/api/schedules';
      let body: any = {
        siteId: data.siteId,
        notes: data.notes,
      };

      if (data.endDate && data.intervalDays) {
        // Recurring schedule
        body.startDate = data.scheduledDate;
        body.endDate = data.endDate;
        body.intervalDays = data.intervalDays;
      } else {
        // Single schedule
        body.scheduledDate = data.scheduledDate;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setSelectedDate(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create schedule');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle schedule completion
   */
  const handleCompleteSchedule = async (schedule: ScheduledVisit) => {
    try {
      const response = await fetch(`/api/schedules/${schedule.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ createNewVisit: true }),
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to complete schedule');
      }
    } catch (error) {
      console.error('Error completing schedule:', error);
    }
  };

  /**
   * Handle schedule cancellation
   */
  const handleCancelSchedule = async (schedule: ScheduledVisit) => {
    if (!confirm('Are you sure you want to cancel this scheduled visit?')) {
      return;
    }

    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to cancel schedule');
      }
    } catch (error) {
      console.error('Error cancelling schedule:', error);
    }
  };

  /**
   * Handle date click in calendar
   */
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowCreateModal(true);
  };

  /**
   * Handle schedule click
   */
  const handleScheduleClick = (schedule: ScheduledVisit) => {
    setSelectedSchedule(schedule);
  };

  if (status === 'loading' || loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </PageContainer>
    );
  }

  if (!session) {
    return (
      <PageContainer>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-yellow-700">
            Please sign in to access the schedule.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Schedule"
        subtitle="Manage upcoming site visits"
        action={
          <Button onClick={() => setShowCreateModal(true)}>
            Schedule Visit
          </Button>
        }
      />

      {/* Reminder Alert */}
      {reminders && (reminders.summary.overdueCount > 0 || reminders.summary.dueSoonCount > 0) && (
        <Card className="p-4 mb-6 bg-warning/10 border-warning/30">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-warning flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-warning">Visit Reminders</h3>
              <p className="text-sm text-text-secondary mt-1">
                {reminders.summary.overdueCount > 0 && (
                  <span className="text-error">
                    {reminders.summary.overdueCount} site{reminders.summary.overdueCount !== 1 ? 's' : ''} overdue for visits.{' '}
                  </span>
                )}
                {reminders.summary.dueSoonCount > 0 && (
                  <span>
                    {reminders.summary.dueSoonCount} site{reminders.summary.dueSoonCount !== 1 ? 's' : ''} due within 2 days.
                  </span>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* View Tabs */}
      <Tabs
        tabs={[
          { id: 'calendar', label: 'Calendar' },
          { id: 'list', label: 'List' },
        ]}
        value={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {/* Calendar View */}
      {activeTab === 'calendar' && (
        <Card className="p-4">
          <ScheduleCalendar
            schedules={schedules}
            onDateClick={handleDateClick}
            onScheduleClick={handleScheduleClick}
          />
        </Card>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <ScheduleList
          schedules={schedules}
          onScheduleClick={handleScheduleClick}
          onComplete={handleCompleteSchedule}
          onCancel={handleCancelSchedule}
          onReschedule={(schedule) => {
            setSelectedSchedule(schedule);
          }}
        />
      )}

      {/* Create Schedule Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedDate(null);
        }}
        title="Schedule Visit"
      >
        <ScheduleForm
          sites={sites}
          defaultDate={selectedDate?.toISOString().split('T')[0]}
          onSubmit={handleCreateSchedule}
          onCancel={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Schedule Detail Modal */}
      <Modal
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        title="Schedule Details"
      >
        {selectedSchedule && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-text-secondary">Site</label>
              <p className="font-medium text-text-primary">
                {selectedSchedule.site.name}
              </p>
              {selectedSchedule.site.organization && (
                <p className="text-sm text-text-secondary">
                  {selectedSchedule.site.organization.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-text-secondary">Scheduled Date</label>
              <p className="font-medium text-text-primary">
                {new Date(selectedSchedule.scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <label className="text-sm text-text-secondary">Status</label>
              <p className="font-medium text-text-primary capitalize">
                {selectedSchedule.status.toLowerCase()}
              </p>
            </div>

            <div>
              <label className="text-sm text-text-secondary">Assigned To</label>
              <p className="font-medium text-text-primary">
                {selectedSchedule.user.firstName} {selectedSchedule.user.lastName}
              </p>
            </div>

            {selectedSchedule.notes && (
              <div>
                <label className="text-sm text-text-secondary">Notes</label>
                <p className="text-text-primary">{selectedSchedule.notes}</p>
              </div>
            )}

            {selectedSchedule.completedVisitLog && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-success">
                  Completed on{' '}
                  {new Date(selectedSchedule.completedVisitLog.visitDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {selectedSchedule.status === 'SCHEDULED' && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => {
                    handleCompleteSchedule(selectedSchedule);
                    setSelectedSchedule(null);
                  }}
                  className="flex-1"
                >
                  Mark Complete
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleCancelSchedule(selectedSchedule);
                    setSelectedSchedule(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* FAB for quick add */}
      <FAB
        onClick={() => setShowCreateModal(true)}
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      />
    </PageContainer>
  );
}
