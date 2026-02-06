import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export default function Register() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('As senhas não coincidem');
        }

        setLoading(true);

        const result = await register({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            is_active: true // Default for now
        });

        if (result.success) {
            navigate('/login');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans transition-colors duration-200">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white mb-4 font-bold text-xl shadow-lg shadow-indigo-500/20">
                        F
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Crie sua conta</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Comece a controlar suas finanças hoje.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-medium border border-rose-100 dark:border-rose-800">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome Completo</label>
                        <input
                            type="text"
                            name="full_name"
                            required
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Seu nome"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Senha</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-all font-sans placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmar Senha</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-all font-sans placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Repita a senha"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 text-base shadow-indigo-500/20"
                    >
                        {loading ? 'Criando conta...' : 'Cadastrar'}
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Já tem uma conta? <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300">Faça login</Link>
                </p>
            </div>
        </div>
    );
}
