import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Users, Phone, MapPin, Coins, Trash2, Edit, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';

const UsersPage = () => {
  const { users, addUser, updateUser, deleteUser, getCustomerDeposits } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    profilePicture: '',
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast.success('User updated successfully');
      setEditingUser(null);
    } else {
      addUser(formData);
      toast.success('User created successfully');
      setIsCreateOpen(false);
    }
    setFormData({ name: '', mobile: '', address: '', profilePicture: '' });
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      mobile: user.mobile,
      address: user.address,
      profilePicture: user.profilePicture || '',
    });
    setEditingUser(user);
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This will also delete all their deposits and payments.`)) {
      deleteUser(user.id);
      toast.success('User deleted successfully');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const UserForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mobile">Mobile Number</Label>
        <Input
          id="mobile"
          placeholder="Enter mobile number"
          value={formData.mobile}
          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="Enter full address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profilePicture">Profile Picture URL (optional)</Label>
        <Input
          id="profilePicture"
          placeholder="Enter image URL"
          value={formData.profilePicture}
          onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1 bg-gradient-to-r from-gold-dark to-gold text-primary">
          {editingUser ? 'Update User' : 'Create User'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsCreateOpen(false);
            setEditingUser(null);
            setFormData({ name: '', mobile: '', address: '', profilePicture: '' });
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">Users</h1>
          <p className="text-muted-foreground">{users.length} registered customers</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-gold-dark to-gold text-primary gap-2 shadow-gold">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new customer to the system</DialogDescription>
            </DialogHeader>
            <UserForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-1">No users found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Try a different search term' : 'Create your first user to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const deposits = getCustomerDeposits(user.id);
            return (
              <Card key={user.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 border-2 border-gold/20">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback className="bg-secondary text-foreground font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-semibold truncate cursor-pointer hover:text-gold transition-colors"
                        onClick={() => navigate(`/users/${user.id}`)}
                      >
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" />
                        <span>{user.mobile}</span>
                      </div>
                      {user.address && (
                        <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="truncate">{user.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-gold" />
                      <span className="text-sm font-medium">{user.totalGoldWeight.toFixed(3)}g</span>
                      <span className="text-xs text-muted-foreground">• {deposits.length} deposits</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update customer information</DialogDescription>
          </DialogHeader>
          <UserForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
