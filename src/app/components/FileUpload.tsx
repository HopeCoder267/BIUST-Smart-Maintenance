/**
 * BIUST Smart Maintenance System - File Upload Component
 * 
 * Handles file attachments for maintenance tickets.
 * Supports drag-and-drop and file selection with preview capabilities.
 * 
 * FEATURES: Drag & Drop, File Preview, Multiple Files, Type Validation
 */

import { useState, useRef, useCallback } from 'react';
import { usePublicAuthStore } from '../store/publicAuthStore';
import { useDataStore } from '../store/dataStore';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, File, X, Image, FileText, AlertCircle } from 'lucide-react';
import { FileAttachment } from '../types';

interface FileUploadProps {
  ticketId: string;
  onUploadComplete?: (attachment: FileAttachment) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

export default function FileUpload({ 
  ticketId, 
  onUploadComplete, 
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*']
}: FileUploadProps) {
  const { user } = usePublicAuthStore();
  const { uploadAttachment, deleteAttachment } = useDataStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file type and size
  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`;
    }
    
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
    
    if (!isValidType) {
      return `File type ${file.type} is not allowed`;
    }
    
    return null;
  };

  // Get file icon based on type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!user) return;
    
    setError(null);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }
      
      // Generate unique filename
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Add to uploading state
      setUploadingFiles(prev => new Map(prev).set(filename, 0));
      
      try {
        // Simulate upload progress (in production, this would be actual upload)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => {
            const current = prev.get(filename) || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return new Map(prev).set(filename, Math.min(current + 10, 90));
          });
        }, 200);
        
        // Create attachment object
        const attachment = {
          ticketId,
          filename,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          filePath: `/uploads/${filename}`,
          uploadedBy: user
        };
        
        // Upload to server
        const uploadSuccess = await uploadAttachment(file, ticketId);
        
        // Complete progress
        setUploadingFiles(prev => new Map(prev).set(filename, 100));
        
        // Remove from uploading state after delay
        setTimeout(() => {
          setUploadingFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(filename);
            return newMap;
          });
        }, 500);
        
        // Add to uploaded files if successful
        if (uploadSuccess) {
          const uploadedAttachment = {
            ...attachment,
            id: `att-${Date.now()}`,
            uploadedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
          
          setUploadedFiles(prev => [...prev, uploadedAttachment]);
          
          // Notify parent
          onUploadComplete?.(uploadedAttachment);
        }
        
        clearInterval(progressInterval);
      } catch (error) {
        console.error('Upload failed:', error);
        setError('Failed to upload file');
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(filename);
          return newMap;
        });
      }
    }
  }, [user, ticketId, uploadAttachment, onUploadComplete]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Handle file deletion
  const handleDeleteFile = async (attachment: FileAttachment) => {
    try {
      await deleteAttachment(attachment.id);
      setUploadedFiles(prev => prev.filter(f => f.id !== attachment.id));
    } catch (error) {
      console.error('Failed to delete file:', error);
      setError('Failed to delete file');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragging ? 'Drop files here' : 'Upload files'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop files here, or click to select
              </p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!user}
            >
              Select Files
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept={allowedTypes.join(',')}
            />
            
            <p className="text-xs text-muted-foreground">
              Max file size: {Math.round(maxFileSize / 1024 / 1024)}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploading Files */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Uploading...</h4>
          {Array.from(uploadingFiles.entries()).map(([filename, progress]) => (
            <Card key={filename} className="bg-gray-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <File className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{filename}</p>
                    <Progress value={progress} className="h-2 mt-1" />
                  </div>
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Uploaded Files</h4>
          {uploadedFiles.map((attachment) => (
            <Card key={attachment.id} className="bg-gray-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(attachment.mimeType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={attachment.originalName}>
                        {attachment.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(attachment)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
