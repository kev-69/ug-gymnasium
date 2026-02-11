import React from 'react';
import type { User } from '@/types';
import { formatDateTime } from '@/utils/helpers';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserCircle, Mail, Phone, IdCard, Home, Calendar } from 'lucide-react';

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            Account information for {user.surname} {user.otherNames}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Surname</p>
                  <p className="text-sm font-medium">{user.surname}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Other Names</p>
                  <p className="text-sm font-medium">{user.otherNames}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="text-sm">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </p>
                    <p className="text-sm">{user.phone}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <Badge variant="outline">{user.gender}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identification */}
          {(user.studentId || user.staffId) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.studentId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                    <p className="text-sm font-mono font-medium">{user.studentId}</p>
                  </div>
                )}
                {user.staffId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Staff ID</p>
                    <p className="text-sm font-mono font-medium">{user.staffId}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Residence Information */}
          {(user.residence !== null || user.hallOfResidence) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Residence Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {user.residence !== null && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">On Campus</p>
                      <Badge variant={user.residence ? 'success' : 'outline'}>
                        {user.residence ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  )}
                  {user.hallOfResidence && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hall of Residence</p>
                      <p className="text-sm font-medium">{user.hallOfResidence}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={user.isActive ? 'success' : 'destructive'}>
                    {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                  <p className="text-sm">{user._count.subscriptions}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-sm">{formatDateTime(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{formatDateTime(user.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
