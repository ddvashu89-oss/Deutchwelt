import React, { useRef } from 'react';
import { Modal } from './Modal.js';
import { Button } from './Button.js';
import { Logo } from '../brand/Logo.js';
import { Award, Printer, CheckCircle, ShieldCheck, Download, Sparkles } from 'lucide-react';

export interface CertificateData {
  id: string;
  certificateNumber: string;
  userFullName: string;
  courseTitle: string;
  level: string;
  gradeScore?: number;
  gradeClassification?: string;
  issuedAt: string;
  instructorName?: string;
  directorName?: string;
  directorTitle?: string;
  verificationCode?: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
}

export function CertificateModal({ isOpen, onClose, certificate }: CertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!certificate) return null;

  const studentName = certificate.userFullName || (certificate as any).studentName || 'Max Mustermann';
  const rawDate = certificate.issuedAt || (certificate as any).issueDate || new Date().toISOString();
  const levelVal = certificate.level || (certificate as any).cefrLevel || 'B1';
  const gradeVal = certificate.gradeClassification || (certificate as any).grade || 'Sehr Gut (94%)';

  const formattedDate = new Date(rawDate).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Offizielles DeutschWelt Zertifikat" maxWidth="2xl">
      <div className="space-y-6">
        {/* Printable Certificate Frame */}
        <div
          ref={printRef}
          className="relative bg-white rounded-2xl border-4 sm:border-8 border-double border-amber-500/80 p-4 sm:p-8 md:p-12 shadow-2xl overflow-hidden print:p-0 print:border-none print:shadow-none"
          style={{ minHeight: '480px' }}
        >
          {/* German Flag Decorative Ribbon Top */}
          <div className="absolute top-0 left-0 right-0 h-2.5 flex">
            <div className="flex-1 bg-black" />
            <div className="flex-1 bg-germanRed" />
            <div className="flex-1 bg-germanGold" />
          </div>

          {/* Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <div className="text-[280px] font-black font-heading text-navy">DW</div>
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> CEFR Certified German Achievement
            </div>

            <div className="flex items-center justify-center pt-1">
              <Logo size="md" asLink={false} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy font-heading pt-2 uppercase tracking-wide">
              Abschlusszertifikat
            </h2>
            <p className="text-xs italic text-dark-muted font-medium">
              Certificate of Successful German Language Competence
            </p>
          </div>

          {/* Body Content */}
          <div className="my-8 text-center space-y-4">
            <p className="text-xs uppercase tracking-widest text-dark-muted font-semibold">
              Hiermit wird offiziell bescheinigt, dass
            </p>

            <div className="py-2 border-b-2 border-dotted border-gray-300 max-w-md mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-navy tracking-tight">
                {studentName}
              </h3>
            </div>

            <p className="text-xs text-dark-muted max-w-lg mx-auto leading-relaxed">
              die Prüfung und das Curriculum des Sprachkurses nach den Standards des Gemeinsamen Europäischen Referenzrahmens für Sprachen (GER) erfolgreich abgeschlossen hat:
            </p>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/90 max-w-lg mx-auto space-y-1">
              <div className="inline-block px-3 py-0.5 rounded-md bg-navy text-white text-xs font-bold uppercase tracking-wider">
                GER Niveau {levelVal}
              </div>
              <h4 className="text-base sm:text-lg font-extrabold text-navy">
                {certificate.courseTitle}
              </h4>
              <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Gesamtnote: {gradeVal}
              </p>
            </div>
          </div>

          {/* Signatures & Seal Footer */}
          <div className="pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 items-center sm:items-end text-center gap-4 sm:gap-2">
            {/* Instructor Signature */}
            <div className="space-y-1 order-2 sm:order-1">
              <div className="font-serif italic text-sm text-navy font-semibold">
                {certificate.instructorName || 'Dr. Katharina Weber'}
              </div>
              <div className="h-0.5 bg-gray-300 w-24 mx-auto" />
              <p className="text-[10px] text-dark-muted font-bold uppercase">Leitende Dozentin</p>
            </div>

            {/* Official Gold Seal */}
            <div className="flex flex-col items-center justify-center order-1 sm:order-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-1 shadow-md flex items-center justify-center text-center text-navy font-extrabold text-[9px] border-2 border-white">
                <div className="w-full h-full rounded-full border border-dashed border-amber-800 flex flex-col items-center justify-center leading-none">
                  <Award className="w-5 h-5 text-navy mb-0.5" />
                  <span className="font-bold tracking-tighter">DW SIEGEL</span>
                </div>
              </div>
              <span className="text-[9px] font-semibold text-dark-muted mt-1">Geprüfte Qualität</span>
            </div>

            {/* Director Signature */}
            <div className="space-y-1 order-3">
              <div className="font-serif italic text-sm text-navy font-semibold">
                {certificate.directorName || 'Dr. Klaus Becker'}
              </div>
              <div className="h-0.5 bg-gray-300 w-24 mx-auto" />
              <p className="text-[10px] text-dark-muted font-bold uppercase">Direktor Akademische Bildung</p>
            </div>
          </div>

          {/* Verification Code Footer */}
          <div className="mt-8 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-[10px] text-dark-muted">
            <span className="flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Zertifikatsnummer: <strong className="text-dark font-mono">{certificate.certificateNumber}</strong>
            </span>
            <span>Ausstellungsdatum: <strong>{formattedDate}</strong></span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-dark-muted flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Offiziell verifizierbares Dokument
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1.5" /> Drucken / PDF speichern
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Schließen
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
