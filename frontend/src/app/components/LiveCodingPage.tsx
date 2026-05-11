import React, { useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import LiveCodingEditor from './LiveCodingEditor';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface LiveCodingPageProps {
  setView: (view: string) => void;
}

const LiveCodingPage: React.FC<LiveCodingPageProps> = ({ setView }) => {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [roomCode, setRoomCode] = useState<string>('');
  const [problemId, setProblemId] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [joinedRoomId, setJoinedRoomId] = useState<string>('');

  const handleJoinRoom = async (code: string) => {
    if (!code.trim()) {
      alert('Please enter a room code');
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/v1/rooms/join`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await clerkUser?.getToken()}`,
          },
          body: JSON.stringify({
            roomCode: code,
            userId: clerkUser?.id,
            role: 'candidate',
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setJoinedRoomId(data.data.roomId);
        setProblemId(data.data.problemId);
        setShowEditor(true);
      } else {
        alert('Failed to join room: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Error joining room. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (showEditor && joinedRoomId && problemId) {
    return (
      <div className="h-full w-full">
        <LiveCodingEditor
          roomId={joinedRoomId}
          userId={clerkUser?.id || ''}
          userName={clerkUser?.fullName || 'User'}
          role="candidate"
          problemId={problemId}
          language="python"
          onCodeChange={() => {}}
          onSubmit={() => {}}
          onRun={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => setView('interview')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Live Coding Interview
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Join Interview Room
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Enter the room code provided by your interviewer
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="E.g., ABC123"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 dark:placeholder-slate-400"
                  maxLength={6}
                />
              </div>

              <button
                onClick={() => handleJoinRoom(roomCode)}
                disabled={isJoining || !roomCode}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Room'
                )}
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 <strong>Tip:</strong> Ask your interviewer for the room code to get started
              </p>
            </div>
          </div>

          {/* Card with Features */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🔴</div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Real-time</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Instant sync</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Execute</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Run code live</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Evaluate</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Auto scoring</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">💬</div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Collaborate</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Live chat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCodingPage;
