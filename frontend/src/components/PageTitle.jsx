import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitle = () => {
    const location = useLocation();

    useEffect(() => {
        const titles = {
            '/': 'Home',
            '/feed': 'Newsfeed',
            '/register': 'Register',
            '/login': 'Login',
            '/buysell': 'Buy & Sell',
            '/housing': 'Housing',
            '/events': 'Events',
            '/messages': 'Messages',
            '/notifications': 'Notifications',
            '/study-groups': 'Study Groups',
            '/jobs': 'Jobs & Internships',
            '/food-menu': 'Campus Eats',
            '/quick-menu': 'Quick Menu',
            '/restaurants': 'Restaurants',
            '/holidays': 'Holiday Calendar',
            '/bus-schedule': 'Bus Schedule',
            '/lost-found': 'Lost & Found',
            '/blood-donation': 'Blood Donation',
            '/saved-posts': 'Saved Posts',
            '/dashboard': 'Dashboard',
            '/admin': 'Admin Panel',
            '/about': 'About Us',
            '/privacy': 'Privacy Policy',
            '/terms': 'Terms of Service',
            '/contact': 'Contact Us',
            '/features': 'Features',
            '/faq': 'FAQ',
            '/help': 'Help Center',
        };

        // Get the base path (first segment)
        const basePath = '/' + location.pathname.split('/')[1];

        // Get title from map or use a default
        let pageTitle = titles[location.pathname] || titles[basePath] || 'SUST Connect';

        // Handle dynamic routes
        if (location.pathname.includes('/profile/')) {
            pageTitle = 'User Profile';
        } else if (location.pathname.includes('/chat/')) {
            pageTitle = 'Chat';
        } else if (location.pathname.includes('/post/')) {
            pageTitle = 'Post';
        } else if (location.pathname.includes('/buysell/') && location.pathname !== '/buysell') {
            pageTitle = 'Buy & Sell Details';
        } else if (location.pathname.includes('/housing/') && location.pathname !== '/housing') {
            pageTitle = 'Housing Details';
        } else if (location.pathname.includes('/jobs/') && location.pathname !== '/jobs') {
            pageTitle = 'Job Details';
        } else if (location.pathname.includes('/events/') && location.pathname !== '/events') {
            pageTitle = 'Event Details';
        } else if (location.pathname.includes('/lost-found/') && location.pathname !== '/lost-found') {
            pageTitle = 'Lost & Found Details';
        } else if (location.pathname.includes('/blood-donation/')) {
            pageTitle = 'Blood Donation';
        } else if (location.pathname.includes('/study-groups/') && location.pathname !== '/study-groups') {
            pageTitle = 'Study Group';
        } else if (location.pathname.includes('/restaurants/') && location.pathname !== '/restaurants') {
            pageTitle = 'Restaurant';
        } else if (location.pathname.includes('/food-menu/') && location.pathname !== '/food-menu') {
            pageTitle = 'Menu Details';
        } else if (location.pathname.includes('/create')) {
            pageTitle = 'Create Post';
        } else if (location.pathname.includes('/edit')) {
            pageTitle = 'Edit Post';
        }

        // Set the document title
        document.title = pageTitle === 'SUST Connect' ? 'SUST Connect - Student Community Platform' : `${pageTitle} | SUST Connect`;
    }, [location]);

    return null;
};

export default PageTitle;
