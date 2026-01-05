'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { AuthComponent } from '@/components/ui/sign-up';
import { createSupabaseClient } from '@/lib/supabase';

export default function LoginPage() {
	const router = useRouter();
	const supabase = useMemo(() => createSupabaseClient(), []);
	const [theme, setTheme] = useState<'light' | 'dark'>(() =>
		typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
	);

	useEffect(() => {
		const root = document.documentElement;
		const hadDark = root.classList.contains('dark');
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
		return () => {
			if (hadDark) root.classList.add('dark');
			else root.classList.remove('dark');
		};
	}, [theme]);

	const handleEmailSubmit = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			// If the user does not exist, try sign-up then sign-in
			const { error: signUpError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/dashboard`,
				},
			});

			if (signUpError) throw signUpError;
			return;
		}

		if (data.session) {
			router.push('/dashboard');
		}
	};

	const handleOAuthClick = async (provider: 'github' | 'google') => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/dashboard`,
			},
		});
		if (error) throw error;
	};

	const handleSuccess = () => {
		router.push('/dashboard');
	};

	return (
		<div className="relative">
			<button
				onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
				className="absolute right-4 top-4 z-50 flex items-center justify-center rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
				aria-label="Toggle theme"
			>
				{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
			</button>
			<AuthComponent
				logo={<div className="bg-slate-900 text-white rounded-md p-1.5 font-bold text-xs">CG</div>}
				brandName="CovenantGuard"
				onEmailSubmit={handleEmailSubmit}
				onOAuthClick={handleOAuthClick}
				onSuccess={handleSuccess}
			/>
		</div>
	);
}
