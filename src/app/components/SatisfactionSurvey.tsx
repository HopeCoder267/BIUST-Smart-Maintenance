/**
 * BIUST Smart Maintenance System - Satisfaction Survey Component
 * 
 * Allows users to provide feedback on completed maintenance tickets.
 * Features star rating system and optional text feedback.
 * 
 * FEATURES: Star Rating, Feedback Collection, Survey Submission
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Star, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import { Ticket, SatisfactionSurvey } from '../types';

interface SatisfactionSurveyProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
}

export default function SatisfactionSurvey({ ticket, isOpen, onClose }: SatisfactionSurveyProps) {
  const { user } = useAuthStore();
  const { submitSatisfactionSurvey, satisfactionSurveys, fetchSatisfactionSurveys } = useDataStore();
  
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (isOpen && ticket.id) {
      fetchSatisfactionSurveys(ticket.id);
    }
  }, [isOpen, ticket.id, fetchSatisfactionSurveys]);

  // Check if user already submitted a survey for this ticket
  const existingSurvey = satisfactionSurveys.find(survey => survey.submittedBy.id === user?.id);
  const canSubmit = !existingSurvey && user && (user.id === ticket.submittedBy.id || user.role === 'coordinator' || user.role === 'operator');

  // Handle survey submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitSatisfactionSurvey({
        ticketId: ticket.id,
        rating,
        feedback: feedback.trim() || undefined,
        submittedBy: user!
      });
      
      // Reset form
      setRating(0);
      setFeedback('');
      onClose();
    } catch (error) {
      console.error('Failed to submit satisfaction survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get rating description
  const getRatingDescription = (rating: number) => {
    switch (rating) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  // Get rating color
  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-lime-500';
      case 5: return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Satisfaction Survey
          </DialogTitle>
          <DialogDescription>
            How satisfied are you with the maintenance service for ticket #{ticket.ticketNumber}?
          </DialogDescription>
        </DialogHeader>

        {existingSurvey ? (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-700">Survey Already Submitted</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Your rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= existingSurvey.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className={`ml-1 font-medium ${getRatingColor(existingSurvey.rating)}`}>
                      {existingSurvey.rating}/5
                    </span>
                  </div>
                </div>
                {existingSurvey.feedback && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">Your feedback:</span>
                    <p className="text-sm text-gray-800 mt-1 bg-white p-2 rounded border">
                      {existingSurvey.feedback}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : canSubmit ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Rate your experience</label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full p-1"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoveredStar || rating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div className="text-center">
                  <span className={`font-medium ${getRatingColor(rating)}`}>
                    {rating}/5 - {getRatingDescription(rating)}
                  </span>
                </div>
              )}
            </div>

            {/* Feedback Text */}
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium text-foreground">
                Additional feedback (optional)
              </label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {feedback.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="gap-2 bg-primary text-white hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        ) : (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="text-center text-gray-600">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  {user ? 'You are not eligible to submit a survey for this ticket.' : 'Please log in to submit a survey.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show existing surveys from other users if coordinator */}
        {user?.role === 'coordinator' && satisfactionSurveys.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-foreground">Other Feedback</h4>
            {satisfactionSurveys
              .filter(survey => survey.submittedBy.id !== user.id)
              .map((survey) => (
                <Card key={survey.id} className="bg-gray-50 border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{survey.submittedBy.name}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= survey.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {survey.feedback && (
                      <p className="text-xs text-gray-600 mt-1">{survey.feedback}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
