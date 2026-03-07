import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Users, Phone, MapPin, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/customers";



interface User {
  id: number;
  name: string;
  mobile: string;
  address: string;
  profilePicture?: string;
}

const UsersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    profilePicture: "",
  });

  /* =========================
     FETCH USERS
  ========================= */

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);

      const mappedUsers = res.data.map((u: any) => ({
        id: u.id,
        name: u.full_name,
        mobile: u.mobile_number,
        address: u.address,
        profilePicture: u.profile_picture_url,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================
     CREATE / UPDATE USER
  ========================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await axios.put(`${API_URL}/${editingUser.id}`, {
          full_name: formData.name,
          mobile_number: formData.mobile,
          address: formData.address,
          profile_picture_url: formData.profilePicture,
        });

        toast.success("User updated successfully");
      } else {
        await axios.post(API_URL, {
          full_name: formData.name,
          mobile_number: formData.mobile,
          address: formData.address,
          profile_picture_url: formData.profilePicture,
        });

        toast.success("User created successfully");
      }

      fetchUsers();

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  /* =========================
     DELETE USER
  ========================= */

  const handleDelete = async (user: User) => {
    if (window.confirm(`Delete ${user.name}?`)) {
      try {
        await axios.delete(`${API_URL}/${user.id}`);
        toast.success("User deleted");
        fetchUsers();
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  /* =========================
     EDIT USER
  ========================= */

  const handleEdit = (user: User) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      mobile: user.mobile,
      address: user.address,
      profilePicture: user.profilePicture || "",
    });

    setIsDialogOpen(true); // 🔥 FIX: open modal
  };

  /* =========================
     RESET FORM
  ========================= */

  const resetForm = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      mobile: "",
      address: "",
      profilePicture: "",
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsDialogOpen(false);
  };

  /* =========================
     SEARCH FILTER
  ========================= */

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile.includes(searchTerm),
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground">
            {users.length} registered customers
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus size={16} /> Add User
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Create User"}
              </DialogTitle>

              <DialogDescription>
                {editingUser
                  ? "Update customer information"
                  : "Add a new customer to the system"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Mobile Number</Label>
                <Input
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Profile Picture URL</Label>
                <Input
                  value={formData.profilePicture}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profilePicture: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  {editingUser ? "Update User" : "Create User"}
                </Button>

                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />

        <Input
          placeholder="Search by name or mobile"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* USER LIST */}

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto mb-4 opacity-50" />
            <p>No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  <Avatar>
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3
                      className="font-semibold cursor-pointer"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      {user.name}
                    </h3>

                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone size={14} />
                      {user.mobile}
                    </div>

                    {user.address && (
                      <div className="text-xs flex items-center gap-1 text-muted-foreground">
                        <MapPin size={12} />
                        {user.address}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit size={16} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
