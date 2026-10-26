import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { VideoPlayer } from '../../components/ui/VideoPlayer.js';
import {
  Video,
  FileText,
  Download,
  Calendar,
  Clock,
  Radio,
  ExternalLink,
  Bell,
  GraduationCap,
  FileVideo,
  Play
} from 'lucide-react';

export function StudentMaterialsPage() {
  const [activeTab, setActiveTab] = useState<'lectures' | 'materials' | 'announcements'>('lectures');
  const [loading, setLoading] = useState(true);

  const [lectures, setLectures] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<any | null>(null);

  useEffect(() => {
    async function loadStudentBatchResources() {
      try {
        setLoading(true);
        const [lRes, mRes]: any[] = await Promise.all([
          api.get('/student/lectures'),
          api.get('/student/materials')
        ]);

        if (lRes.success) setLectures(lRes.lectures);
        if (mRes.success) {
          setMaterials(mRes.materials);
          setAnnouncements(mRes.announcements || []);
        }
      } catch (e) {
        console.error('Error fetching student batch files:', e);
      } finally {
        setLoading(false);
      }
    }

    loadStudentBatchResources();
  }, []);

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-3xl bg-[#11172B] border border-[#1F2742]" />;
  }

  return (
    <div className="space-y-7 sm:space-y-8 pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <FileText className="w-3 h-3" />
              Teacher Shared Resources
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            Class Lectures & Study Files
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Access recorded lessons, live coaching links, grammar cheat sheets, and practice worksheets uploaded by your instructor.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1F2742]">
        <button
          onClick={() => setActiveTab('lectures')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'lectures'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" /> Lectures & Video Classes ({lectures.length})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'materials'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Worksheets & Cheat Sheets ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'announcements'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" /> Instructor Noticeboard ({announcements.length})
        </button>
      </div>

      {/* TAB 1: LECTURES */}
      {activeTab === 'lectures' && (
        <div className="space-y-6">
          {lectures.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#11172B] border border-[#1F2742]">
              <Video className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Lectures Uploaded Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Your batch instructor has not published any lectures yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map(lec => (
                <div key={lec.id} className="p-6 rounded-3xl bg-[#11172B] border border-[#1F2742] shadow-xl shadow-black/40 flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                          {lec.level || 'A1'}
                        </span>
                        {lec.fileSize && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                            <FileVideo className="w-3 h-3 text-blue-400" /> {lec.fileSize}
                          </span>
                        )}
                      </div>
                      {lec.isLive ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                          <Radio className="w-3 h-3 text-rose-400" /> Live Session
                        </span>
                      ) : lec.meetingUrl ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          lec.meetingUrl.includes('meet.google.com')
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : lec.meetingUrl.includes('zoom.us')
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : 'bg-[#0B0F21] text-slate-300 border-[#1F2742]'
                        }`}>
                          {lec.meetingUrl.includes('meet.google.com') ? 'Google Meet' : lec.meetingUrl.includes('zoom.us') ? 'Zoom' : 'Live Room'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {lec.videoUrl?.startsWith('/uploads/') ? 'Uploaded Video' : 'On-Demand Video'}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white line-clamp-1">{lec.title}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Instructor: {lec.teacherName}</p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {lec.description || 'Instructional German lesson covering key grammar and vocabulary.'}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-[#1F2742]">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lec.durationMinutes} min</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(lec.scheduledFor).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1F2742] space-y-2">
                    {lec.meetingUrl && (
                      <a
                        href={lec.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md ${
                          lec.meetingUrl.includes('meet.google.com')
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : lec.meetingUrl.includes('zoom.us')
                            ? 'bg-blue-600 hover:bg-blue-500'
                            : 'bg-rose-600 hover:bg-rose-500'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        {lec.meetingUrl.includes('meet.google.com')
                          ? 'Live beitreten auf Google Meet'
                          : lec.meetingUrl.includes('zoom.us')
                          ? 'Live beitreten auf Zoom'
                          : 'Live Class beitreten'}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {lec.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedLecture(lec)}
                        className="w-full py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        {lec.meetingUrl ? 'Aufzeichnung ansehen' : 'Video-Lektion abspielen'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDY MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {materials.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#11172B] border border-[#1F2742]">
              <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Study Materials Uploaded Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Your instructor will upload worksheets and cheat sheets here as your cohort progresses.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map(mat => (
                <div key={mat.id} className="p-6 rounded-3xl bg-[#11172B] border border-[#1F2742] shadow-xl shadow-black/40 flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-black uppercase">
                        {mat.fileType || 'PDF'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">{mat.fileSize || '1.0 MB'}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white line-clamp-1">{mat.title}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Uploaded by {mat.teacherName}</p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {mat.description || 'Downloadable study material for Goethe exam preparation.'}
                    </p>

                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#0B0F21] text-slate-300 text-[10px] uppercase font-bold border border-[#1F2742]">
                      {mat.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#1F2742]">
                    <a
                      href={mat.fileUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1A2238] hover:bg-[#253050] text-slate-200 text-xs font-bold transition-colors border border-[#2D385E]"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Resource
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {announcements.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#11172B] border border-[#1F2742]">
              <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Announcements Posted</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Your instructor will post schedule changes and noticeboard updates here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(anc => (
                <div key={anc.id} className="p-6 rounded-3xl bg-[#11172B] border border-[#1F2742] shadow-xl shadow-black/40 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {anc.teacherName} • {anc.batchName}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{anc.title}</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(anc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {anc.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WATCH LECTURE MODAL */}
      {selectedLecture && (
        <Modal
          isOpen={Boolean(selectedLecture)}
          onClose={() => setSelectedLecture(null)}
          title={selectedLecture.title}
          description={`Instructor: ${selectedLecture.teacherName} • ${selectedLecture.durationMinutes} min ${selectedLecture.fileSize ? `• ${selectedLecture.fileSize}` : ''}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 pt-2">
            <VideoPlayer url={selectedLecture.videoUrl} title={selectedLecture.title} autoPlay />
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1F2742]">
              <span>Level: <strong className="text-emerald-400">{selectedLecture.level}</strong></span>
              {(selectedLecture.videoUrl?.startsWith('/uploads/') || selectedLecture.videoUrl?.endsWith('.mp4')) && (
                <a
                  href={selectedLecture.videoUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 font-bold hover:underline"
                >
                  <Download className="w-3.5 h-3.5" /> Download Video for Offline Study
                </a>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedLecture.description}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default StudentMaterialsPage;
