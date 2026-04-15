import { useState, useEffect} from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { cn } from "@/lib/utils";

const Profile = ({user, setUser}) => {
    const API_URL = import.meta.env.VITE_API_BASE_URL || "";

    const token = localStorage.getItem("jwtToken");
    const location = useLocation();
    const navigate = useNavigate();
    
    // States 
    const [posts, setPosts] = useState(() => {
        const saved = sessionStorage.getItem("cachedPosts");
        return saved ? JSON.parse(saved) : [];
    });

    const [isLoading, setIsLoading] = useState(() => {
        return sessionStorage.getItem("cachedPosts") ? false : true;
    });

    const [toastMessage, setToastMessage] = useState("");
    const [errors, setErrors] = useState("");

    // Set the toast message and disappear after 3 seconds
    useEffect(() => {
        if(location.state?.successMessage) {
            setToastMessage(location.state.successMessage);
            navigate(location.pathname, {replace: true, state: {}});
        }
    }, [location.state, navigate, location.pathname]);

    useEffect(() => {
        if(toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    useEffect(() => {
        const getPosts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/get-posts`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })

                const data = await res.json();

                if(!res.ok) {
                    setErrors(data.message)
                }
                else {
                    const publishedPosts = data.posts.filter(post => post.status === "published");
                    setPosts(publishedPosts)
                    sessionStorage.setItem("cachedPosts", JSON.stringify(publishedPosts));
                }
            } 
            finally {
                setIsLoading(false);
            }
        } 
        getPosts();  
    }, [token]);

    const handleLogout = async (e) => {
        e.preventDefault(e)
        const res = await fetch(`${API_URL}/api/logout`, {
            method: 'GET'
        })

        if(!res.ok) {
            throw new Error("Can't logout, please try again!")
        }
        else {
            localStorage.removeItem('jwtToken');
            setUser({auth: false, name: ''});
            setToastMessage("You have successfully logged out!");
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col">
            <nav className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="flex flex-wrap items-center justify-between w-full max-w-6xl mx-auto px-4 py-3 sm:h-16 sm:py-0">
                    <div className="font-geist font-bold text-xl text-slate-900 tracking-tight order-1 shrink-0">
                        MyDevBlog
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 order-2 sm:order-3 shrink-0">
                        {user.auth ? (
                            <>
                                <p className="text-sm text-slate-700 hidden sm:block">
                                    Welcome <strong>{user.name}</strong>
                                </p>
                                <button 
                                    onClick={handleLogout}
                                    className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ): (
                            <Link 
                                to={"/login"}
                                className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                Log In
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-6 font-geist text-[14px] sm:text-[15px] font-medium text-slate-500 order-3 sm:order-2 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 sm:border-none">
                        <Link to="/profile" className="text-indigo-600 font-semibold">
                            Home
                        </Link>
                        <Link to="/about" className="hover:text-slate-900 transition-colors">
                            About
                        </Link>
                        <a href="https://github.com/rudrakshkr" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            {errors && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                    {errors}
                </div>
            )}

            {/* Toast Notification (Adjusted max-width for tiny phones) */}
            <div
                className={cn(
                    "fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out w-[90%] max-w-[350px] sm:w-auto",
                    toastMessage 
                        ? "opacity-100 translate-y-0" 
                        : "opacity-0 -translate-y-8 pointer-events-none"
                )}
            >
                <div className="flex items-center gap-3 bg-white border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-4 sm:px-5 py-3 rounded-xl w-full">
                    <div className="flex items-center justify-center size-8 bg-emerald-50 rounded-lg shrink-0">
                        <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                        <p className="text-[14px] font-bold text-slate-900 leading-none">Success</p>
                        <p className="text-[13px] font-medium text-slate-500 truncate">
                            {toastMessage}
                        </p>
                    </div>
                </div>
            </div>

            <main className="w-full flex flex-col flex-1 bg-[#f8fafc] pt-8 px-4 pb-12">
                {/* 2. Responsive Text for Main Header */}
                <div className="w-full max-w-6xl px-2 sm:px-4 mx-auto flex flex-col gap-3 sm:gap-4 text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">Latest Articles</h1>
                    <p className="text-sm sm:text-base text-slate-500">Exploring web development, full-stack technologies, and best practices.</p>
                </div>

                {/* Display posts (Grid is already responsive!) */}
                {isLoading ? (
                    <div className="flex justify-center p-10">
                        <p className="text-slate-500 font-medium animate-pulse">Loading your posts...</p>
                    </div>
                ): (
                    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 py-8 sm:py-10">
                        {posts.map(post => (
                            <Link 
                                className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1.5 group" 
                                key={post.id}
                                to={`/blogs/${post.urlSlug}`}
                                state={{initialPostData: post}}
                            >
                                <div className="w-full aspect-[16/9] bg-slate-100 overflow-hidden shrink-0">
                                    <img 
                                        src={post.coverImage} 
                                        alt="Cover Image" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                                    />
                                </div>
                                
                                <div className="p-5 sm:p-6 flex flex-col flex-grow gap-3.5">
                                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                        {post.category}
                                    </div>
                                    
                                    <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                                        {post.title}
                                    </h3>

                                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                        {post.summary}
                                    </p>

                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {post.tags.map((tag, index) => (
                                                <span 
                                                    key={index} 
                                                    className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-md"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between text-[12px] sm:text-[13px] text-slate-500 font-medium">
                                        <span className="text-slate-800">{post.date}</span>
                                        <span className="flex items-center gap-1.5">
                                            {post.readMin || 5} min read
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Profile