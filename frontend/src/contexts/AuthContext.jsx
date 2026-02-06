import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            // Optionally logout if token is invalid
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects 'username'
            formData.append('password', password);

            const response = await api.post('/login/access-token', formData);
            const { access_token } = response.data;

            localStorage.setItem('token', access_token);
            // api header update handled by interceptor

            await fetchUserProfile();

            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return {
                success: false,
                error: error.response?.data?.detail || "Falha no login"
            };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/users/', userData); // Assuming generic user creation endpoint
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || "Erro no cadastro"
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
