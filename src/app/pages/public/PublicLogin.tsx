/**
 * BIUST Smart Maintenance System - Public Login Page
 * 
 Three-step login process for students and staff:
 1. Select block
 2. Select room
 3. Enter digital key
 * 
 * Keys are reset each semester and pre loaded from CSV imports.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Building2, DoorOpen, Key, ArrowRight } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useEffect } from 'react';

/**
 * PublicLogin Component
 * 
 * Handles authentication for the public reporting side.
 * Students and staff log in using: Block → Room → Digital Key
 */
export default function PublicLogin() {
  const navigate = useNavigate();
  const { loginPublic } = useAuthStore();
  const { blocks, fetchPublicBlocks, fetchPublicRooms } = useDataStore();

  const [rooms, setRooms] = useState<string[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);

  useEffect(() => {
    console.log('Fetching blocks for resident login...');
    fetchPublicBlocks();
  }, [fetchPublicBlocks]);
  
  // Form state
  const [step, setStep] = useState(1);
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [digitalKey, setDigitalKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Handle block selection
   * Advances to room selection step
   */
  const handleBlockSelect = async (blockName: string) => {
    setSelectedBlock(blockName);
    setStep(2);
    setIsRoomsLoading(true);
    try {
      // Find the selected block to get its ID
      const selectedBlockData = blocks.find(b => b.name === blockName);
      if (!selectedBlockData) {
        throw new Error('Block not found');
      }
      
      const fetchedRooms = await fetchPublicRooms(selectedBlockData.id);
      setRooms(fetchedRooms);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setIsRoomsLoading(false);
    }
  };
  
  /**
   * Handle room selection
   * Advances to digital key entry step
   */
  const handleRoomSelect = (roomNumber: string) => {
    setSelectedRoom(roomNumber);
    setStep(3);
  };
  
  /**
   * Handle form submission
   * Validates credentials and logs in user
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Attempt login with provided credentials
      // The authStore will validate the digital key and return the correct user
      await loginPublic(
        {
          block: selectedBlock,
          room: selectedRoom,
          digitalKey: digitalKey.trim(),
        }
      );
      
      // Show success message
      toast.success('Login successful!', {
        description: 'Welcome to BIUST Smart Maintenance System',
      });
      
      // Navigate to resident dashboard
      navigate('/resident');
    } catch (error) {
      // Show error message
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Invalid credentials',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Reset form to first step
   */
  const handleReset = () => {
    setStep(1);
    setSelectedBlock('');
    setSelectedRoom('');
    setDigitalKey('');
    setRooms([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 shadow-lg shadow-primary/20 overflow-hidden">
            <img
                src="/BIUST-logo (1).svg"
                alt="BIUST Logo"
                className="w-full h-full object-contain p-1"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            BIUST Smart Maintenance
          </h1>
          <p className="text-muted-foreground">
            Report and track maintenance issues in your residence
          </p>
        </div>
        
        {/* Login Card */}
        <Card className="bg-white border-border shadow-xl">
          <CardHeader>
            <CardTitle className="text-foreground">Resident Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === 1 && 'Select your residence block'}
              {step === 2 && 'Select your room number'}
              {step === 3 && 'Enter your digital key'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-6">
              {Array.isArray([1, 2, 3]) && [1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      s <= step
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s === 1 && <Building2 className="w-4 h-4" />}
                    {s === 2 && <DoorOpen className="w-4 h-4" />}
                    {s === 3 && <Key className="w-4 h-4" />}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        s < step ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Step 1: Block Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <Label htmlFor="block" className="text-foreground font-semibold">Residence Block</Label>
                <Select value={selectedBlock} onValueChange={handleBlockSelect}>
                  <SelectTrigger id="block" className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="Select your block" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border text-foreground">
                    {Array.isArray(blocks) && blocks.length > 0 ? blocks.map((block) => (
                      <SelectItem key={block.id} value={block.name}>
                        {block.name} - {block.description || 'Residential Block'}
                      </SelectItem>
                    )) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">No blocks available</div>
                    )}
                  </SelectContent>
                </Select>
                
                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary">
                    <strong>Note:</strong> Select the block where your room is located.
                  </p>
                </div>
              </div>
            )}
            
            {/* Step 2: Room Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="room" className="text-foreground font-semibold">Room Number</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    Change Block
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  Selected: <strong className="text-foreground">{selectedBlock}</strong>
                </p>
                
                <Select value={selectedRoom} onValueChange={handleRoomSelect} disabled={isRoomsLoading}>
                  <SelectTrigger id="room" className="bg-muted border-border text-foreground">
                    <SelectValue placeholder={isRoomsLoading ? "Loading rooms..." : "Select your room"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border text-foreground">
                    {Array.isArray(rooms) && rooms.length > 0 ? (
                      rooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          Room {room}
                        </SelectItem>
                      ))
                    ) : !isRoomsLoading ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">No rooms found</div>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Step 3: Digital Key Entry */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="digitalKey" className="text-foreground font-semibold">Digital Key</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(2)}
                    className="text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    Change Room
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  <strong className="text-foreground">{selectedBlock}</strong> • Room <strong className="text-foreground">{selectedRoom}</strong>
                </p>
                
                <Input
                  id="digitalKey"
                  type="password"
                  placeholder="Enter your digital key"
                  value={digitalKey}
                  onChange={(e) => setDigitalKey(e.target.value)}
                  required
                  autoFocus
                  className="text-lg tracking-wider bg-muted border-border text-foreground text-center"
                />
                
                
                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1 border-border text-foreground hover:bg-muted"
                  >
                    Start Over
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !digitalKey.trim()}
                    className="flex-1 gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    {isLoading ? 'Verifying...' : 'Login'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 mb-2">
            For staff and operations access:
          </p>
          <Button
            variant="link"
            onClick={() => navigate('/private')}
            className="text-blue-600 hover:text-blue-700"
          >
            Staff Login →
          </Button>
        </div>
        
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Digital keys are reset each semester.</p>
          <p className="mt-1">
            For assistance, contact IT Support: BSMsupport@biust.ac.bw
          </p>
        </div>
      </div>
    </div>
  );
}