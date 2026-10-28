import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { VideoPlayer } from '../../components/ui/VideoPlayer.js';
import {
  Video,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  Clock,
  Radio,
  BookOpen,
  Bell,
  CheckCircle2,
  FileCheck,
  UploadCloud,
  FileVideo,
  Play,
  X
} from 'lucide-react';

export function TeacherMaterialsPage() {
  const [activeTab, setActiveTab] = useState<'lectures' | 'materials' | 'announcements'>('lectures');
  const [loading, setLoading] = useState(true);

  const [batches, setBatches] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Modals
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [previewLecture, setPreviewLecture] = useState<any | null>(null);

  // Lecture Form State
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDesc, setLectureDesc] = useState('');
  const [lectureBatchId, setLectureBatchId] = useState('');
  const [videoSourceType, setVideoSourceType] = useState<'upload' | 'url'>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [lectureVideoUrl, setLectureVideoUrl] = useState('');
  const [lectureMeetingUrl, setLectureMeetingUrl] = useState('');
  const [lectureDuration, setLectureDuration] = useState('45');
  const [lectureLevel, setLectureLevel] = useState('A1');
  const [lectureIsLive, setLectureIsLive] = useState(false);
  const [lectureSaving, setLectureSaving] = useState(false);

  // Material Form State
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDesc, setMaterialDesc] = useState('');
  const [materialCategory, setMaterialCategory] = useState('WORKSHEET');
  const [materialBatchId, setMaterialBatchId] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialFileUrl, setMaterialFileUrl] = useState('');
  const [materialFileType, setMaterialFileType] = useState('PDF');
  const [materialLevel, setMaterialLevel] = useState('A1');
  const [materialSaving, setMaterialSaving] = useState(false);

  // Announcement Form State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementBatchId, setAnnouncementBatchId] = useState('');
  const [announcementSaving, setAnnouncementSaving] = useState(false);

  const resetLectureForm = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setLectureTitle('');
    setLectureDesc('');
    setLectureVideoUrl('');
    setLectureMeetingUrl('');
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setVideoSourceType('upload');
    setDragActive(false);
    setLectureIsLive(false);
    setLectureDuration('45');
  };

  const handleVideoFileSelect = (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|ogg)$/i)) {
      alert('Please select a valid video file (.mp4, .webm, .mov, .mkv).');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      alert('Video file exceeds 500MB limit. Please compress or choose a smaller file.');
      return;
    }
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, lRes, mRes, aRes]: any[] = await Promise.all([
        api.get('/teacher/batches'),
        api.get('/teacher/lectures'),
        api.get('/teacher/materials'),
        api.get('/teacher/announcements')
      ]);

      if (bRes.success) {
        setBatches(bRes.batches);
        if (bRes.batches.length > 0) {
          const firstId = bRes.batches[0].id;
          setLectureBatchId(firstId);
          setMaterialBatchId(firstId);
          setAnnouncementBatchId(firstId);
        }
      }
      if (lRes.success) setLectures(lRes.lectures);
      if (mRes.success) setMaterials(mRes.materials);
      if (aRes.success) setAnnouncements(aRes.announcements);
    } catch (e) {
      console.error('Error fetching teacher resources:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (videoSourceType === 'upload' && !videoFile && !lectureVideoUrl && !lectureIsLive) {
      alert('Please select a video file to upload, or provide an external video URL, or mark as a live session.');
      return;
    }
    setLectureSaving(true);
    try {
      if (videoSourceType === 'upload' && videoFile) {
        const formData = new FormData();
        formData.append('title', lectureTitle);
        formData.append('description', lectureDesc);
        formData.append('batchId', lectureBatchId);
        formData.append('level', lectureLevel);
        formData.append('durationMinutes', lectureDuration);
        formData.append('isLive', String(lectureIsLive));
        formData.append('meetingUrl', lectureMeetingUrl);
        formData.append('video', videoFile);
        const res: any = await api.upload('/teacher/lectures', formData);
        if (res.success) {
          setIsLectureModalOpen(false);
          resetLectureForm();
          fetchData();
        }
      } else {
        const res: any = await api.post('/teacher/lectures', {
          title: lectureTitle,
          description: lectureDesc,
          batchId: lectureBatchId,
          videoUrl: lectureVideoUrl,
          meetingUrl: lectureMeetingUrl,
          durationMinutes: Number(lectureDuration),
          level: lectureLevel,
          isLive: lectureIsLive
        });
        if (res.success) {
          setIsLectureModalOpen(false);
          resetLectureForm();
          fetchData();
        }
      }
    } catch (e: any) {
      console.error('Error creating lecture:', e);
      alert(e?.message || 'Failed to create lecture. Please try again.');
    } finally {
      setLectureSaving(false);
    }
  };

  const handleDeleteLecture = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;
    try {
      const res: any = await api.delete(`/teacher/lectures/${id}`);
      if (res.success) fetchData();
    } catch (e) {
      console.error('Error deleting lecture:', e);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setMaterialSaving(true);
    try {
      if (materialFile) {
        const formData = new FormData();
        formData.append('title', materialTitle);
        formData.append('description', materialDesc);
        formData.append('category', materialCategory);
        formData.append('batchId', materialBatchId);
        formData.append('level', materialLevel);
        formData.append('file', materialFile);
        const res: any = await api.upload('/teacher/materials', formData);
        if (res.success) {
          setIsMaterialModalOpen(false);
          setMaterialTitle('');
          setMaterialDesc('');
          setMaterialFile(null);
          setMaterialFileUrl('');
          fetchData();
        }
      } else {
        const res: any = await api.post('/teacher/materials', {
          title: materialTitle,
          description: materialDesc,
          category: materialCategory,
          batchId: materialBatchId,
          fileUrl: materialFileUrl || '/uploads/materials/sample_doc.pdf',
          fileType: materialFileType,
          level: materialLevel,
          fileSize: '1.2 MB'
        });
        if (res.success) {
          setIsMaterialModalOpen(false);
          setMaterialTitle('');
          setMaterialDesc('');
          setMaterialFile(null);
          setMaterialFileUrl('');
          fetchData();
        }
      }
    } catch (e: any) {
      console.error('Error creating material:', e);
      alert(e?.message || 'Failed to upload material. Please try again.');
    } finally {
      setMaterialSaving(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      const res: any = await api.delete(`/teacher/materials/${id}`);
      if (res.success) fetchData();
    } catch (e) {
      console.error('Error deleting material:', e);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementSaving(true);
    try {
      const res: any = await api.post('/teacher/announcements', {
        title: announcementTitle,
        content: announcementContent,
        batchId: announcementBatchId
      });
      if (res.success) {
        setIsAnnouncementModalOpen(false);
        setAnnouncementTitle('');
        setAnnouncementContent('');
        fetchData();
      }
    } catch (e) {
      console.error('Error creating announcement:', e);
    } finally {
      setAnnouncementSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy tracking-tight">Class Lectures & Study Materials</h1>
          <p className="text-xs text-dark-muted">Upload video lessons, practice worksheets, and broadcast announcements to your assigned cohorts.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'lectures' && (
            <Button variant="secondary" size="md" onClick={() => setIsLectureModalOpen(true)} className="font-bold shadow-md">
              <Plus className="w-4 h-4 mr-1" /> Add / Schedule Lecture
            </Button>
          )}
          {activeTab === 'materials' && (
            <Button variant="secondary" size="md" onClick={() => setIsMaterialModalOpen(true)} className="font-bold shadow-md">
              <Plus className="w-4 h-4 mr-1" /> Upload Material
            </Button>
          )}
          {activeTab === 'announcements' && (
            <Button variant="secondary" size="md" onClick={() => setIsAnnouncementModalOpen(true)} className="font-bold shadow-md">
              <Plus className="w-4 h-4 mr-1" /> Post Announcement
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('lectures')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'lectures'
              ? 'border-germanRed text-germanRed'
              : 'border-transparent text-dark-muted hover:text-dark'
          }`}
        >
          <Video className="w-4 h-4" /> Lectures & Video Classes ({lectures.length})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'materials'
              ? 'border-germanRed text-germanRed'
              : 'border-transparent text-dark-muted hover:text-dark'
          }`}
        >
          <FileText className="w-4 h-4" /> Worksheets & Cheat Sheets ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'announcements'
              ? 'border-germanRed text-germanRed'
              : 'border-transparent text-dark-muted hover:text-dark'
          }`}
        >
          <Bell className="w-4 h-4" /> Batch Noticeboard ({announcements.length})
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <>
          {/* TAB 1: LECTURES */}
          {activeTab === 'lectures' && (
            <div className="space-y-6">
              {lectures.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white border border-gray-200">
                  <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-navy">No Lectures Published Yet</h3>
                  <p className="text-xs text-dark-muted max-w-sm mx-auto mt-1 mb-4">
                    Upload recorded video lectures or schedule interactive Google Meet/Zoom coaching sessions for your students.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setIsLectureModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Upload First Lecture
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lectures.map(lec => (
                    <div key={lec.id} className="p-6 rounded-3xl bg-white border border-gray-200 shadow-subtle flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded bg-navy text-white text-[10px] font-black uppercase">
                              {lec.level || 'A1'}
                            </span>
                            {lec.fileSize && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                <FileVideo className="w-3 h-3 text-blue-600" /> {lec.fileSize}
                              </span>
                            )}
                          </div>
                          {lec.isLive ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-germanRed bg-red-50 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                              <Radio className="w-3 h-3 text-germanRed" /> Live Session
                            </span>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              {lec.videoUrl?.startsWith('/uploads/') ? 'Uploaded Video' : 'Video Lesson'}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-navy line-clamp-1">{lec.title}</h3>
                          <p className="text-xs text-dark-muted font-medium mt-0.5">{lec.batch?.name || 'Class Batch'}</p>
                        </div>

                        <p className="text-xs text-dark-muted leading-relaxed line-clamp-2">
                          {lec.description || 'Instructional German lesson covering key grammatical and spoken patterns.'}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lec.durationMinutes} min</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(lec.scheduledFor).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                        {lec.meetingUrl ? (
                          <a href={lec.meetingUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-germanRed hover:underline flex items-center gap-1">
                            Join Meeting <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            onClick={() => setPreviewLecture(lec)}
                            className="text-xs font-bold text-navy hover:text-germanRed transition-colors flex items-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" /> Watch Preview
                          </button>
                        )}
                        <div className="flex items-center gap-2">
                          {lec.videoUrl && (lec.videoUrl.startsWith('/uploads/') || lec.videoUrl.endsWith('.mp4')) && (
                            <a
                              href={lec.videoUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-400 hover:text-navy transition-colors p-1"
                              title="Download Video File"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteLecture(lec.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Delete Lecture"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                <div className="p-12 text-center rounded-3xl bg-white border border-gray-200">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-navy">No Study Materials Uploaded Yet</h3>
                  <p className="text-xs text-dark-muted max-w-sm mx-auto mt-1 mb-4">
                    Upload grammar summary sheets, vocabulary PDF tables, and exercise worksheets for your students to download.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setIsMaterialModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Upload First File
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materials.map(mat => (
                    <div key={mat.id} className="p-6 rounded-3xl bg-white border border-gray-200 shadow-subtle flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase">
                            {mat.fileType || 'PDF'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">{mat.fileSize || '1.0 MB'}</span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-navy line-clamp-1">{mat.title}</h3>
                          <p className="text-xs text-dark-muted font-medium mt-0.5">{mat.batch?.name || 'Class Batch'}</p>
                        </div>

                        <p className="text-xs text-dark-muted leading-relaxed line-clamp-2">
                          {mat.description || 'Downloadable study material for Goethe exam preparation.'}
                        </p>

                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {mat.category.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                        <a
                          href={mat.fileUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-navy hover:text-white text-dark text-xs font-bold transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                        <button
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Delete Material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                <div className="p-12 text-center rounded-3xl bg-white border border-gray-200">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-navy">No Announcements Posted</h3>
                  <p className="text-xs text-dark-muted max-w-sm mx-auto mt-1 mb-4">
                    Send noticeboard announcements, schedule changes, and study reminders directly to your students.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setIsAnnouncementModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Post Announcement
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map(anc => (
                    <div key={anc.id} className="p-6 rounded-3xl bg-white border border-gray-200 shadow-subtle space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-germanRed">
                            {anc.batch?.name || 'Class Batch'}
                          </span>
                          <h3 className="text-base font-bold text-navy mt-0.5">{anc.title}</h3>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {new Date(anc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-dark leading-relaxed whitespace-pre-line">
                        {anc.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL 1: ADD / UPLOAD LECTURE */}
      <Modal
        isOpen={isLectureModalOpen}
        onClose={() => {
          resetLectureForm();
          setIsLectureModalOpen(false);
        }}
        title="Upload & Schedule Class Lecture"
        description="Upload an MP4/WebM video lesson directly or publish a YouTube/Vimeo stream or live class session."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateLecture} className="space-y-4 pt-2">
          <Input
            label="Lecture Title"
            placeholder="e.g. A1.2 Akkusativ Präpositionen (durch, für, gegen)"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                Target Batch
              </label>
              <select
                value={lectureBatchId}
                onChange={(e) => setLectureBatchId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
                required
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.level})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                CEFR Level
              </label>
              <select
                value={lectureLevel}
                onChange={(e) => setLectureLevel(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="A1">A1 Beginner</option>
                <option value="A2">A2 Elementary</option>
                <option value="B1">B1 Intermediate</option>
                <option value="B2">B2 Upper Intermediate</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Lecture Description & Grammar Notes
            </label>
            <textarea
              rows={3}
              placeholder="Key grammatical concepts, vocabulary takeaways, and homework instructions covered in this video lecture..."
              value={lectureDesc}
              onChange={(e) => setLectureDesc(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          {/* Video Lecture Source Mode */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Video Source
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setVideoSourceType('upload')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  videoSourceType === 'upload'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-dark-muted hover:text-dark'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-germanRed" /> Upload Video File
              </button>
              <button
                type="button"
                onClick={() => setVideoSourceType('url')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  videoSourceType === 'url'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-dark-muted hover:text-dark'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" /> External URL / Embed
              </button>
            </div>

            {videoSourceType === 'upload' ? (
              <div className="space-y-3">
                {!videoFile ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleVideoFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      dragActive ? 'border-germanRed bg-red-50/50' : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="videoFileInput"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleVideoFileSelect(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-navy">
                      Click to choose video file or drag and drop
                    </p>
                    <p className="text-[11px] text-dark-muted mt-1">
                      Supports MP4, WebM, MOV, MKV files up to 500 MB
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                          <FileVideo className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy truncate">{videoFile.name}</p>
                          <p className="text-[11px] text-gray-500">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
                          setVideoFile(null);
                          setVideoPreviewUrl(null);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Remove video file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {videoPreviewUrl && (
                      <div className="mt-2 aspect-video w-full rounded-xl bg-black overflow-hidden shadow">
                        <video
                          src={videoPreviewUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Input
                label="Video URL / Embed Link (YouTube, Vimeo, Cloud MP4)"
                placeholder="https://www.youtube.com/watch?v=... or https://...mp4"
                value={lectureVideoUrl}
                onChange={(e) => setLectureVideoUrl(e.target.value)}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Duration (Minutes)"
              type="number"
              placeholder="45"
              value={lectureDuration}
              onChange={(e) => setLectureDuration(e.target.value)}
              required
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-dark">Live Meeting Link</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLectureMeetingUrl('https://meet.google.com/')}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 hover:bg-emerald-100"
                  >
                    Google Meet
                  </button>
                  <button
                    type="button"
                    onClick={() => setLectureMeetingUrl('https://zoom.us/j/')}
                    className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200 hover:bg-blue-100"
                  >
                    Zoom
                  </button>
                </div>
              </div>
              <Input
                placeholder="https://meet.google.com/... or https://zoom.us/j/..."
                value={lectureMeetingUrl}
                onChange={(e) => setLectureMeetingUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isLiveCheckbox"
              checked={lectureIsLive}
              onChange={(e) => setLectureIsLive(e.target.checked)}
              className="w-4 h-4 text-germanRed rounded focus:ring-germanRed"
            />
            <label htmlFor="isLiveCheckbox" className="text-xs font-bold text-dark cursor-pointer">
              Mark as Interactive Live Class Session
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                resetLectureForm();
                setIsLectureModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={lectureSaving}>
              {lectureSaving ? 'Uploading Lecture...' : 'Publish Lecture'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: UPLOAD MATERIAL */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title="Upload Study Material & Worksheet"
        description="Share reference cheat sheets, grammar exercises, and vocabulary tables with your students."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateMaterial} className="space-y-4 pt-2">
          <Input
            label="Material Title"
            placeholder="e.g. A1 Verbliste mit unregelmäßigen Verben (PDF)"
            value={materialTitle}
            onChange={(e) => setMaterialTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                Target Batch
              </label>
              <select
                value={materialBatchId}
                onChange={(e) => setMaterialBatchId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
                required
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.level})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                Category
              </label>
              <select
                value={materialCategory}
                onChange={(e) => setMaterialCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="WORKSHEET">Practice Worksheet</option>
                <option value="GRAMMAR_CHEAT_SHEET">Grammar Cheat Sheet</option>
                <option value="VOCABULARY_LIST">Vocabulary Table</option>
                <option value="EXAM_SIMULATION">Goethe Mock Exam</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Material Description
            </label>
            <textarea
              rows={3}
              placeholder="Instructions on how students should use this worksheet..."
              value={materialDesc}
              onChange={(e) => setMaterialDesc(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Upload Document File (.pdf, .docx, .zip)
            </label>
            <div className="relative border border-dashed rounded-xl p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.zip,.mp3,.mp4"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setMaterialFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {materialFile ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-navy">
                  <FileCheck className="w-4 h-4 text-green-600" />
                  <span>{materialFile.name} ({(materialFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs text-dark-muted">
                  <UploadCloud className="w-4 h-4 text-gray-400" />
                  <span>Click to select PDF or worksheet file (or specify URL below)</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Document URL / Cloud Path (Fallback)"
              placeholder="/uploads/materials/A1_Grammatik.pdf"
              value={materialFileUrl}
              onChange={(e) => setMaterialFileUrl(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                File Type
              </label>
              <select
                value={materialFileType}
                onChange={(e) => setMaterialFileType(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="PDF">PDF Document</option>
                <option value="DOCX">Word Document (.docx)</option>
                <option value="MP3">Audio Listening (.mp3)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsMaterialModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={materialSaving}>
              Upload Material
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: POST ANNOUNCEMENT */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title="Post Batch Noticeboard Announcement"
        description="Broadcast important information and scheduling alerts to your students."
        maxWidth="md"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 pt-2">
          <Input
            label="Announcement Title"
            placeholder="e.g. Schedule update for Thursday's conversation class"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Target Batch
            </label>
            <select
              value={announcementBatchId}
              onChange={(e) => setAnnouncementBatchId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              required
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.level})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Announcement Message
            </label>
            <textarea
              rows={4}
              placeholder="Write your announcement message in German or English..."
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAnnouncementModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={announcementSaving}>
              Post to Noticeboard
            </Button>
          </div>
        </form>
      </Modal>

      {/* PREVIEW VIDEO MODAL */}
      {previewLecture && (
        <Modal
          isOpen={Boolean(previewLecture)}
          onClose={() => setPreviewLecture(null)}
          title={previewLecture.title}
          description={`Batch: ${previewLecture.batch?.name || 'Class'} • ${previewLecture.durationMinutes} min ${previewLecture.fileSize ? `• ${previewLecture.fileSize}` : ''}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 pt-2">
            <VideoPlayer url={previewLecture.videoUrl} title={previewLecture.title} autoPlay />
            <div className="flex items-center justify-between text-xs text-dark-muted pt-2 border-t border-gray-100">
              <span>Level: <strong className="text-navy">{previewLecture.level}</strong></span>
              {(previewLecture.videoUrl?.startsWith('/uploads/') || previewLecture.videoUrl?.endsWith('.mp4')) && (
                <a
                  href={previewLecture.videoUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-germanRed font-bold hover:underline"
                >
                  <Download className="w-3.5 h-3.5" /> Download Video File
                </a>
              )}
            </div>
            <p className="text-xs text-dark leading-relaxed whitespace-pre-line">
              {previewLecture.description}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
