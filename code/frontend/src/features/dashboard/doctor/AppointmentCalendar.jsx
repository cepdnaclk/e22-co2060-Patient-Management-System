import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from "lucide-react";

export default function AppointmentCalendar({ appointments = [], onDateChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc, apt) => {
    if (!apt.appointmentDateTime) return acc;
    const dateStr = new Date(apt.appointmentDateTime).toDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(apt);
    return acc;
  }, {});

  const renderDays = () => {
    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 opacity-30 bg-slate-50/50" />);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const dayAppointments = appointmentsByDate[dateStr] || [];
      const hasAppointments = dayAppointments.length > 0;
      
      days.push(
        <div 
          key={day} 
          onClick={() => onDateChange && onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          className={`min-h-[100px] p-2 border-t border-l border-slate-100 transition-colors cursor-pointer hover:bg-slate-50 ${isToday(day) ? 'bg-blue-50/30' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-slate-700'}`}>
              {day}
            </span>
            {hasAppointments && (
              <Badge variant="info" className="px-1.5 py-0 text-[10px] bg-blue-100 text-blue-700">
                {dayAppointments.length}
              </Badge>
            )}
          </div>
          
          <div className="mt-2 flex flex-col gap-1 max-h-[60px] overflow-hidden">
            {dayAppointments.slice(0, 2).map((apt, i) => (
              <div key={i} className="text-[10px] leading-tight px-1.5 py-1 bg-white border border-slate-200 rounded truncate text-slate-700 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span className="truncate">{apt.patientName || 'Patient'}</span>
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <div className="text-[10px] text-slate-500 pl-1 font-medium">
                +{dayAppointments.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <Card className="shadow-lg shadow-slate-200/50 border-none">
      <CardHeader 
        className="pb-4"
        title={
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-1">
              <Button variant="secondary" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-full border-slate-200">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full border-slate-200">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        }
        action={
          <Button variant="primary" size="sm" icon={CalendarIcon}>
            Schedule
          </Button>
        }
      />
      <div className="p-0">
        <div className="grid grid-cols-7 border-t border-b border-slate-100 bg-slate-50/80">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-slate-100 bg-white">
          {renderDays()}
        </div>
      </div>
    </Card>
  );
}
