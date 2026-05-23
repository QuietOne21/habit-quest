import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header({ dashboard }) {
  const { user, logout } = useAuth();
  const u = dashboard?.user;

  return (
    <div className="header">
      <div>
        <h1 className="header-title">HabitQuest</h1>
        <p className="header-sub">
          {new Date().getFullYear()} &nbsp;·&nbsp;
          {dashboard?.habits?.length || 0} habits tracked
          &nbsp;·&nbsp; {u?.username || user?.username}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="header-badges">
          <span className="badge badge-purple">
            🔥 {u?.currentStreak || 0} day streak
          </span>
          <span className="badge badge-cyan">
            ⚡ Level {u?.level || 1}
          </span>
          <span className="badge badge-pink">
            🏆 {u?.totalBadges || 0} badges
          </span>
        </div>
        <button className="header-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}