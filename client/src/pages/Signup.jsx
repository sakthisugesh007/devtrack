import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Github, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import { API_URL } from '../api';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signup(formData.name, formData.email, formData.password);
            navigate('/connect-account');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Account" subtitle="Start your journey to better coding productivity">
            <Card className="p-8 backdrop-blur-xl bg-white/[0.03] border-white/10">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        icon={User}
                    />

                    <Input
                        label="Email Address"
                        placeholder="you@example.com"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        icon={Mail}
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        icon={Lock}
                    />

                    <div className="block">
                        <Button className="w-full justify-center" variant="primary" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#0d122f] text-gray-500">Or sign up with</span>
                        </div>
                    </div>

                    <a href={`${API_URL}/api/auth/github`}>
                        <Button type="button" variant="secondary" className="w-full justify-center" icon={Github}>
                            GitHub
                        </Button>
                    </a>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-400">Already have an account? </span>
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
                        Sign in
                    </Link>
                </div>
            </Card>
        </AuthLayout>
    );
};

export default Signup;
