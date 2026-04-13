import { useState, useEffect} from "react"
import { Link } from "react-router"

const Profile = ({user, setUser}) => {
    const token = localStorage.getItem("jwtToken");
    // States 
    const [posts, setPosts] = useState(() => {
        const saved = sessionStorage.getItem("cachedPosts");
        return saved ? JSON.parse(saved) : [];
    });

    const [isLoading, setIsLoading] = useState(() => {
        return sessionStorage.getItem("cachedPosts") ? false : true;
    });

    const [errors, setErrors] = useState("");

    useEffect(() => {
        const getPosts = async () => {
            try {
                const res = await fetch('/api/get-posts', {
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
                    // Successfully got the data!
                    console.log(data.posts)
                    setPosts(data.posts)
                    sessionStorage.setItem("cachedPosts", JSON.stringify(data.posts));
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
        const res = await fetch('/api/logout', {
            method: 'GET'
        })

        if(!res.ok) {
            throw new Error("Can't logout, please try again!")
        }
        else {
            localStorage.removeItem('jwtToken');
            setUser({auth: false, name: ''})
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col">
            <nav className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="flex justify-between items-center w-full max-w-6xl mx-auto px-4 h-16">
                    
                    {/* Left Side: Header & Navigation */}
                    <div className="flex items-center gap-8">
                        <div className="font-geist font-bold text-xl text-slate-900 tracking-tight">
                            MyDevBlog
                        </div>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-6 font-geist text-[15px] font-medium text-slate-500">
                            <Link to="/profile" className="text-indigo-600 font-semibold">
                                Home
                            </Link>
                            <Link to="/new-post" className="hover:text-slate-900 transition-colors">
                                About
                            </Link>
                            <a href="https://github.com/newbbiecoder" target="_blank" className="hover:text-slate-900 transition-colors">
                                GitHub
                            </a>
                        </div>
                    </div>

                    {/* Right Side: User Info & Logout */}
                    {user.auth ? (
                        <div className="flex items-center gap-6">
                            <p className="text-md text-slate-700">
                                Welcome <strong>{user.name}</strong>
                            </p>
                            
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-1.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ): (
                        <div className="flex items-center gap-6">
                            <Link 
                                to={"/login"}
                                className="px-4 py-1.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                Log In
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {errors && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                    {errors}
                </div>
            )}

            <main className="w-full flex flex-col flex-1 bg-[#f8fafc] pt-8 px-4 pb-12">
                {/* Post Header  */}
                <div className="w-full max-w-6xl px-4 mx-auto flex flex-col gap-4">
                    <h1 className="text-5xl font-semibold">Latest Articles</h1>
                    <p className="text-slate-500">Exploring web development, full-stack technologies, and best practices.</p>
                </div>

                {/* Display posts  */}
                {isLoading ? (
                    <div className="flex justify-center p-10">
                        <p className="text-slate-500 font-medium animate-pulse">Loading your posts...</p>
                    </div>
                ): (
                    <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
                        {posts.map(post => (
                            <Link 
                                className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1.5 group" 
                                key={post.id}
                                to={`/blogs/${post.urlSlug}`}
                                state={{initialPostData: post}}
                                // onClick={() => handlePostClick(post.id)}
                            >
                                <div className="w-full aspect-[16/9] bg-slate-100 overflow-hidden shrink-0">
                                    {/* Cover Image  */}
                                    <img 
                                        src={post.coverImage} 
                                        alt="Cover Image" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                                    />
                                </div>
                                
                                <div className="p-6 flex flex-col flex-grow gap-3.5">
                                    
                                    {/* Category  */}
                                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                        {post.category}
                                    </div>
                                    
                                    {/* Title  */}
                                    <h3 className="font-extrabold text-xl text-slate-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                                        {post.title}
                                    </h3>

                                    {/* Summary      */}
                                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                        {post.summary}
                                    </p>

                                    {/* Tags  */}
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
                                    
                                    {/* Date and Read Time  */}
                                    <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between text-[13px] text-slate-500 font-medium">
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