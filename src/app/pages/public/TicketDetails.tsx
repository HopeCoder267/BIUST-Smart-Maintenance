/**
 * BIUST Smart Maintenance System - Ticket Details Page
 * 
 * Detailed view of a single ticket with full progress timeline
 */

import { useParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import ProgressTimeline from '../../components/ProgressTimeline';
import { format } from 'date-fns';

export default function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { tickets } = useDataStore();
  
  const ticket = tickets.find((t) => t.id === ticketId);
  
  if (!ticket) {
    return (
      <Card className="bg-white border-border">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Ticket not found</p>
          <Button onClick={() => navigate('/resident')} className="mt-4 bg-primary text-white hover:bg-primary/90">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/resident')} className="gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
      
      <Card className="bg-white border-border shadow-sm">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-2 text-foreground">{ticket.title}</h1>
          <p className="text-muted-foreground mb-6">{ticket.description}</p>
          
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">
              Submitted: {format(new Date(ticket.createdAt), 'MMMM d, yyyy HH:mm')}
            </p>
          </div>
          
          <ProgressTimeline
            currentStage={ticket.currentStage}
            progressHistory={ticket.progressHistory}
            variant="horizontal"
            showNotes={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
