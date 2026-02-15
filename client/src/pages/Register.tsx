import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerStudent, registerStaff, registerPublic } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'STUDENT' | 'STAFF' | 'PUBLIC'>('PUBLIC');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    surname: '',
    otherNames: '',
    phone: '',
    gender: '' as 'MALE' | 'FEMALE' | '',
    studentId: '',
    residence: false,
    hallOfResidence: '',
    staffId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Common validations
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (!formData.surname) newErrors.surname = 'Surname is required';
    if (!formData.otherNames) newErrors.otherNames = 'Other names are required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (formData.phone.length < 10) newErrors.phone = 'Valid phone number is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Role-specific validations
    if (role === 'STUDENT') {
      if (!formData.studentId) newErrors.studentId = 'Student ID is required';
      if (formData.residence && !formData.hallOfResidence) {
        newErrors.hallOfResidence = 'Hall of residence is required when residence is checked';
      }
    } else if (role === 'STAFF') {
      if (!formData.staffId) newErrors.staffId = 'Staff ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (role === 'STUDENT') {
        response = await registerStudent({
          studentId: formData.studentId,
          email: formData.email,
          password: formData.password,
          surname: formData.surname,
          otherNames: formData.otherNames,
          phone: formData.phone,
          gender: formData.gender as 'MALE' | 'FEMALE',
          residence: formData.residence,
          hallOfResidence: formData.hallOfResidence || undefined,
        });
      } else if (role === 'STAFF') {
        response = await registerStaff({
          staffId: formData.staffId,
          email: formData.email,
          password: formData.password,
          surname: formData.surname,
          otherNames: formData.otherNames,
          phone: formData.phone,
          gender: formData.gender as 'MALE' | 'FEMALE',
        });
      } else {
        response = await registerPublic({
          email: formData.email,
          password: formData.password,
          surname: formData.surname,
          otherNames: formData.otherNames,
          phone: formData.phone,
          gender: formData.gender as 'MALE' | 'FEMALE',
        });
      }

      const { user, accessToken } = response.data.data;

      // Store user data and token
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', accessToken);

      // Trigger auth state change event
      window.dispatchEvent(new Event('authStateChanged'));

      toast.success('Account created successfully!');
      
      // Check if there's a plan selected before registration
      const selectedPlanId = localStorage.getItem('selectedPlanId');
      if (selectedPlanId) {
        localStorage.removeItem('selectedPlanId'); // Clean up
        navigate(`/subscribe/${selectedPlanId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-12">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground mt-2">Join UG Gymnasium today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <Select value={role} onValueChange={(value: string) => setRole(value as 'STUDENT' | 'STAFF' | 'PUBLIC')}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public User</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role-specific ID fields */}
          {role === 'STUDENT' && (
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Enter your student ID"
              />
              {errors.studentId && <p className="text-sm text-destructive">{errors.studentId}</p>}
            </div>
          )}

          {role === 'STAFF' && (
            <div className="space-y-2">
              <Label htmlFor="staffId">Staff ID</Label>
              <Input
                id="staffId"
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                placeholder="Enter your staff ID"
              />
              {errors.staffId && <p className="text-sm text-destructive">{errors.staffId}</p>}
            </div>
          )}

          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Enter your surname"
              />
              {errors.surname && <p className="text-sm text-destructive">{errors.surname}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherNames">Other Names</Label>
              <Input
                id="otherNames"
                name="otherNames"
                value={formData.otherNames}
                onChange={handleChange}
                placeholder="Enter your other names"
              />
              {errors.otherNames && <p className="text-sm text-destructive">{errors.otherNames}</p>}
            </div>
          </div>

          {/* Contact fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0XX XXX XXXX"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          </div>

          {/* Password and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value: string) => setFormData((prev) => ({ ...prev, gender: value as 'MALE' | 'FEMALE' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
            </div>
          </div>

          {/* Student-specific: Residence fields */}
          {role === 'STUDENT' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="residence"
                  name="residence"
                  checked={formData.residence}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="residence" className="cursor-pointer">
                  I live on campus
                </Label>
              </div>

              {formData.residence && (
                <div className="space-y-2">
                  <Label htmlFor="hallOfResidence">Hall of Residence</Label>
                  <Select 
                    value={formData.hallOfResidence} 
                    onValueChange={(value: string) => {
                      setFormData((prev) => ({ ...prev, hallOfResidence: value }));
                      if (errors.hallOfResidence) {
                        setErrors((prev) => ({ ...prev, hallOfResidence: '' }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your hall of residence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Commonwealth Hall">Commonwealth Hall</SelectItem>
                      <SelectItem value="Volta Hall">Volta Hall</SelectItem>
                      <SelectItem value="Legon Hall">Legon Hall</SelectItem>
                      <SelectItem value="Akuafo Hall">Akuafo Hall</SelectItem>
                      <SelectItem value="International Student Hostel">International Student Hostel</SelectItem>
                      <SelectItem value="Jubilee Hall">Jubilee Hall</SelectItem>
                      <SelectItem value="Dr Hilla Liman Hall">Dr Hilla Liman Hall</SelectItem>
                      <SelectItem value="Alexander Adum Kwapong Hall">Alexander Adum Kwapong Hall</SelectItem>
                      <SelectItem value="Elizabeth Frances Sey Hall">Elizabeth Frances Sey Hall</SelectItem>
                      <SelectItem value="Jean Nelson Hall">Jean Nelson Hall</SelectItem>
                      <SelectItem value="Diamond Jubilee Hall">Diamond Jubilee Hall</SelectItem>
                      <SelectItem value="Pent Hall">Pent Hall</SelectItem>
                      <SelectItem value="Bani Hostel">Bani Hostel</SelectItem>
                      <SelectItem value="Evandy Hostel">Evandy Hostel</SelectItem>
                      <SelectItem value="James Topp Yankah Hall">James Topp Yankah Hall</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.hallOfResidence && <p className="text-sm text-destructive">{errors.hallOfResidence}</p>}
                </div>
              )}
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Register;
