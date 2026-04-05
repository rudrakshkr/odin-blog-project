import { Link } from "react-router"

const Profile = ({user, setUser}) => {
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
            <nav className="w-full bg-white shadow-sm border-b border-slate-200 z-10 relative">
                <div className="flex justify-between items-center w-full max-w-6xl mx-auto px-4 pt-4">
                    
                    <div className="flex gap-8 font-geist text-[#6f7279] font-semibold">
                        <Link to="/profile" className="pb-4 text-indigo-600 border-b-2 border-indigo-600">
                            Posts
                        </Link>
                        
                        <Link to="/new-post" className="pb-4 hover:text-slate-900 transition-colors">
                            New Post
                        </Link>
                        
                        <Link to="/comments" className="pb-4 hover:text-slate-900 transition-colors">
                            Comments
                        </Link>
                    </div>

                    <div className="pb-4 text-md">
                        <p>Welcome <strong>{user.name}</strong></p>
                    </div>
                    
                </div>
            </nav>
            <main className="w-full flex-1 bg-[#f8fafc]">
                
            </main>
        </div>
    )
}

export default Profile