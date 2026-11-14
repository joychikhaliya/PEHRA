import React, { useState } from 'react';
import {
  X,
  MapPin,
  AlertTriangle,
  Ruler,
  Camera,
  CheckCircle2,
  Upload,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport?: (reportData: any) => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [step, setStep] = useState<number>(1);
  const [location, setLocation] = useState<string>('Kurla East, Station Road (Near Railway Subway)');
  const [severity, setSeverity] = useState<'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [waterDepthCm, setWaterDepthCm] = useState<number>(45);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [reportId, setReportId] = useState<string>('');

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `REP-MMR-${Math.floor(1000 + Math.random() * 9000)}`;
      setReportId(generatedId);
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSubmitReport) {
        onSubmitReport({
          id: generatedId,
          location,
          severity,
          waterDepthCm,
          timestamp: new Date().toISOString(),
        });
      }
    }, 700);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setIsSubmitted(false);
    setPhotoPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[24px] bg-white border border-[#E2EAED] shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2EAED] bg-[#F5F8FA]/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18B7A0] text-white">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#17242A]">Report Flooding</h3>
              <p className="text-xs text-[#6B7C83]">Crowdsourced Hyperlocal Intelligence</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DDF8F6] text-[#18B7A0]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#17242A]">Report Received</h4>
                <p className="text-xs text-[#6B7C83] max-w-sm mx-auto mt-1">
                  Your ground observation has been logged under{' '}
                  <span className="font-mono font-bold text-[#18B7A0]">{reportId}</span> and
                  routed to the MCGM Emergency Control Room.
                </p>
              </div>
              <div className="rounded-xl border border-[#E2EAED] bg-[#F5F8FA] p-3 text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6B7C83]">Location:</span>
                  <span className="font-medium text-[#17242A]">{location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7C83]">Observed Water Depth:</span>
                  <span className="font-medium text-[#17242A]">{waterDepthCm} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7C83]">Severity:</span>
                  <span className="font-bold text-[#F28B55]">{severity}</span>
                </div>
              </div>
              <button
                onClick={handleResetAndClose}
                className="w-full rounded-xl bg-[#18B7A0] py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#15a28e] transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs text-[#6B7C83]">
                <span className="font-semibold text-[#18B7A0]">Step {step} of 4</span>
                <span>
                  {step === 1 && 'Confirm Location'}
                  {step === 2 && 'Severity Level'}
                  {step === 3 && 'Water Depth'}
                  {step === 4 && 'Photo & Submit'}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#EEF6F7]">
                <div
                  className="h-1.5 rounded-full bg-[#18B7A0] transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>

              {/* Step 1: Location */}
              {step === 1 && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#17242A] flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#18B7A0]" />
                    Incident / Flooding Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-[#E2EAED] bg-[#F5F8FA] px-3.5 py-2.5 text-xs text-[#17242A] focus:bg-white focus:border-[#18B7A0] focus:outline-none transition-all"
                    placeholder="Enter landmark, road or area in Mumbai..."
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Kurla East', 'Dharavi T-Junction', 'Sion Circle', 'Andheri Subway', 'Milan Subway'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLocation(preset)}
                        className="rounded-full border border-[#E2EAED] bg-white px-2.5 py-1 text-[11px] text-[#6B7C83] hover:border-[#18B7A0] hover:text-[#18B7A0] transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Severity */}
              {step === 2 && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#17242A] flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#18B7A0]" />
                    Severity of Inundation
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'LOW', label: 'Minor Ponding', desc: 'Passable for cars', color: '#5B9CF6' },
                      { id: 'MODERATE', label: 'Curb Overflow', desc: 'Slow vehicle traffic', color: '#E8B84A' },
                      { id: 'HIGH', label: 'Knee-Deep Water', desc: 'Subway blocked, pedestrians stuck', color: '#F28B55' },
                      { id: 'CRITICAL', label: 'Severe Submersion', desc: 'Immediate rescue required', color: '#E65A68' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSeverity(item.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          severity === item.id
                            ? 'border-[#18B7A0] bg-[#DDF8F6]/30 shadow-xs'
                            : 'border-[#E2EAED] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs font-semibold text-[#17242A]">{item.label}</span>
                        </div>
                        <p className="text-[10px] text-[#6B7C83] mt-1">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Water Depth */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#17242A] flex items-center gap-1.5">
                      <Ruler className="h-3.5 w-3.5 text-[#18B7A0]" />
                      Estimated Water Depth
                    </label>
                    <span className="text-sm font-bold text-[#18B7A0]">{waterDepthCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="5"
                    value={waterDepthCm}
                    onChange={(e) => setWaterDepthCm(Number(e.target.value))}
                    className="w-full accent-[#18B7A0]"
                  />
                  <div className="flex justify-between text-[11px] text-[#6B7C83]">
                    <span>Ankle (10 cm)</span>
                    <span>Knee (45 cm)</span>
                    <span>Waist (90 cm)</span>
                    <span>Chest (120+ cm)</span>
                  </div>
                  <div className="rounded-xl bg-[#EEF6F7] p-3 text-xs text-[#17242A]">
                    <span className="font-semibold text-[#18B7A0]">Note:</span> Depths over 30 cm
                    cause stalling in standard two-wheelers and sedans.
                  </div>
                </div>
              )}

              {/* Step 4: Photo & Submit */}
              {step === 4 && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#17242A] flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-[#18B7A0]" />
                    Attach Ground Photo (Optional)
                  </label>
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E2EAED] bg-[#F5F8FA] p-5 cursor-pointer hover:border-[#18B7A0] transition-colors">
                    {photoPreview ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden">
                        <img
                          src={photoPreview}
                          alt="Flood preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                          Photo Attached
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-[#6B7C83] mb-1" />
                        <span className="text-xs font-medium text-[#17242A]">
                          Click to upload or drag photo
                        </span>
                        <span className="text-[10px] text-[#6B7C83]">JPEG, PNG up to 5MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>

                  <div className="rounded-xl border border-[#E2EAED] bg-white p-3 text-xs space-y-1">
                    <div className="flex justify-between text-[#6B7C83]">
                      <span>Location:</span>
                      <span className="font-medium text-[#17242A]">{location}</span>
                    </div>
                    <div className="flex justify-between text-[#6B7C83]">
                      <span>Severity:</span>
                      <span className="font-semibold text-[#17242A]">{severity}</span>
                    </div>
                    <div className="flex justify-between text-[#6B7C83]">
                      <span>Depth:</span>
                      <span className="font-bold text-[#18B7A0]">{waterDepthCm} cm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E2EAED]">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-[#6B7C83] hover:bg-slate-100 transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#18B7A0] px-4 py-2 text-xs font-semibold text-white hover:bg-[#15a28e] transition-colors"
                  >
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-xl bg-[#18B7A0] px-5 py-2 text-xs font-semibold text-white hover:bg-[#15a28e] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm & Submit Report'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
