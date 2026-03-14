import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Github, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import { API_URL } from '../api';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, devLogin } = useAuth();
    const [formData, setFormData] = useState({
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
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDevLogin = async () => {
        try {
            await devLogin();
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to continue tracking your productivity">
            <Card className="p-8 backdrop-blur-xl bg-white/[0.03] border-white/10">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
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

                    <div className="space-y-1">
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
                        <div className="flex justify-end">
                            <Link to="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <div className="block">
                        <Button className="w-full justify-center" variant="primary" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#0d122f] text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <a href={`${API_URL}/api/auth/github`}>
                        <Button type="button" variant="secondary" className="w-full justify-center" icon={Github}>
                            GitHub
                        </Button>
                    </a>
                    <div className="mt-4">
                        <Button type="button" onClick={handleDevLogin} variant="ghost" className="w-full justify-center text-xs text-gray-500 hover:text-white">
                            (Dev Mode: Bypass Auth)
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-400">Don't have an account? </span>
                    <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
                        Sign up
                    </Link>
                </div>
            </Card>
        </AuthLayout>
    );
};

export default Login;
