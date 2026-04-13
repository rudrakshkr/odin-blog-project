import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

const Comments = ({user}) => {
    const token = localStorage.getItem("jwtToken");

    // States
    const [comments, setComments] = useState(() => {
        const saved = sessionStorage.getItem("cachedComments");
        return saved ? JSON.parse(saved) : [];
    });
    const [errors, setErrors] = useState('');
    const [isLoading, setIsLoading] = useState(() => {
        return sessionStorage.getItem("cachedComments") ? false : true;
    });
    const [successMessage, setSuccessMessage] = useState('');

    const [deletingId, setDeletingId] = useState(null);

    const [selectedPostFilter, setSelectedPostFilter] = useState('all');

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

    const deleteComment = async (commentId) => {
        const isConfirmed = window.confirm("Are you sure you want to permanently delete this comment? This cannot be undone.");
        if(!isConfirmed) return;
        
        try {
            setDeletingId(commentId);

            const res = await fetch(`/api/${commentId}/delete-comment`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })

            const data = await res.json();

            if(!res.ok) {
                setErrors(data.message);
            }

            else {
                setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));

                const updatedCache = comments.filter(comment => comment.id !== commentId);
                sessionStorage.setItem("cachedComments", JSON.stringify(updatedCache));
                
                setSuccessMessage(`Success: Comment has been deleted`);
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        }
        catch(err) {
            setErrors("Network error while deleting post.");
        }
        finally {
            setDeletingId(null);
        }
    }
 
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch('/api/getAllComments', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })

                const data = await res.json();

                if(!res.ok) {
                    setErrors(data.message);
                    return;
                }
                else {
                    setComments(data.comments);
                    sessionStorage.setItem("cachedComments", JSON.stringify(data.comments));
                }
            }
            catch(err) {
                setErrors("Server error while fetching comments.");
                console.error("Fetch error: ", err);
            }
            finally {
                setIsLoading(false);
            }
        }

        fetchComments();
    }, [token]);

    const uniquePosts = useMemo(() => {
        if(!comments || comments.length === 0) return [];
        const postsMap = new Map();

        comments.forEach(c => {
            if(c.post && c.postId) {
                postsMap.set(c.postId, c.post.title);
            }
        });

        return Array.from(postsMap, ([id, title]) => ({id, title}))
    }, [comments]);

    const filteredComments = useMemo(() => {
        if(selectedPostFilter === 'all') return comments;
        return comments.filter(c => c.postId === parseInt(selectedPostFilter));
    }, [comments, selectedPostFilter])

    return (
        <div className="w-full min-h-screen flex flex-col">
            <nav className="w-full bg-white shadow-sm border-b border-slate-200 z-10 relative">
                <div className="flex justify-between items-center w-full max-w-6xl mx-auto px-4 pt-4">
                    
                    {/* Left Side: Navigation Links */}
                    <div className="flex gap-8 font-geist text-[#6f7279] font-semibold">
                        <Link to="/profile" className="pb-4 hover:text-slate-900 transition-colors ">
                            Posts
                        </Link>
                        
                        <Link to="/new-post" className="pb-4 hover:text-slate-900 transition-colors">
                            New Post
                        </Link>
                        
                        <Link to="/comments" className="pb-4 text-indigo-600 border-b-2 border-indigo-600">
                            Comments
                        </Link>
                    </div>

                    {/* Right Side: User Info & Logout Button */}
                    <div className="flex items-center gap-6 pb-4">
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
                    
                </div>
            </nav>
            <main className="w-full flex-1 bg-[#f8fafc] py-8">
                <div className="max-w-6xl mx-auto px-4 flex flex-col gap-6">
                    
                    {/* Header & Filter Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Comments</h1>
                            <span className="text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                                {filteredComments ? filteredComments.length : 0} Total
                            </span>
                        </div>
                        
                        {/* Filter Dropdown */}
                        {uniquePosts.length > 0 && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label htmlFor="postFilter" className="text-sm font-semibold text-slate-600 whitespace-nowrap">Filter by Post:</label>
                                <select 
                                    id="postFilter"
                                    value={selectedPostFilter}
                                    onChange={(e) => setSelectedPostFilter(e.target.value)}
                                    className="w-full sm:w-64 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                                >
                                    <option value="all">All Posts</option>
                                    {uniquePosts.map(post => (
                                        <option key={post.id} value={post.id}>
                                            {post.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Alerts */}
                    {errors && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {errors}
                        </div>
                    )}
                    
                    {successMessage && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            {successMessage}
                        </div>
                    )}

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <p className="text-slate-500 font-medium animate-pulse">Loading comments...</p>
                        </div>
                    ) : !comments || comments.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No comments yet</h3>
                            <p className="text-slate-500">When readers comment on your posts, they will appear here.</p>
                        </div>
                    ) : filteredComments.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No comments for this post</h3>
                            <button onClick={() => setSelectedPostFilter('all')} className="text-indigo-600 hover:underline text-sm font-medium mt-2">Clear filter</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredComments.map((comment) => (
                                <div key={comment.id} className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between transition-all hover:shadow-md group">
                                    
                                    <div className="flex gap-4 items-start w-full">
                                        <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg mt-1">
                                            {comment.name ? comment.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                <span className="font-bold text-slate-900">{comment.name || "Anonymous"}</span>
                                                <span className="text-xs text-slate-300 hidden sm:block">•</span>
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                    {comment.date || 'Recent'}
                                                </span>
                                            </div>
                                            
                                            {comment.post && (
                                                <div className="text-[13px] font-medium text-indigo-600/80 bg-indigo-50/50 self-start px-2.5 py-1 rounded-md border border-indigo-100 inline-flex items-center gap-1.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                                    On: {comment.post.title}
                                                </div>
                                            )}

                                            <p className="text-slate-700 text-[15px] leading-relaxed mt-1 line-clamp-3 break-words">
                                                {comment.comment}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 self-end md:self-start mt-3 md:mt-0 border-t border-slate-100 md:border-none pt-4 md:pt-0 w-full md:w-auto justify-end">
                                        <button
                                            onClick={() => deleteComment(comment.id)}
                                            disabled={deletingId === comment.id}
                                            className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50 flex items-center gap-2 group-hover:border-red-300"
                                            title="Delete this comment"
                                        >
                                            {deletingId === comment.id ? "Deleting..." : (
                                                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> Delete</>
                                            )}
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Comments;