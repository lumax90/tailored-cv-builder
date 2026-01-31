import React, { useState, useRef } from 'react';
import { useCV } from '../store/CVContext';
import { extractTextFromPDF } from '../services/parser';
import { parseProfileFromText } from '../services/ai';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Linkedin } from 'lucide-react';

const ImportHub: React.FC = () => {
    const { loadProfile, profile, importHistory, addImportRecord, clearImportHistory } = useCV();
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;



        setIsProcessing(true);
        setStatus({ type: 'info', message: 'Extracting text from document...' });

        try {
            // 1. Extract Text
            let rawText = '';
            if (file.type === 'application/pdf') {
                rawText = await extractTextFromPDF(file);
            } else {
                // Determine if we can read as text
                // simplified for now, assuming text based if not PDF (like .txt, .md)
                // In production might need mammoth.js for docx
                throw new Error("Only PDF files are supported for now (LinkedIn Export is PDF).");
            }

            setStatus({ type: 'info', message: 'AI is analyzing your profile data...' });

            // 2. Parse with AI
            const extractedProfile = await parseProfileFromText(rawText);

            // 3. Merge and Enrich with IDs
            // The AI might not return IDs, so we must generate them to ensure React lists work correctly.
            const generateId = () => Math.random().toString(36).substring(2, 9); // Simple unique ID

            const enrichedProfile: any = { ...extractedProfile };

            // Arrays that need IDs
            const arrayFields = ['experience', 'education', 'projects', 'certifications', 'languages', 'volunteer', 'awards', 'publications'];

            arrayFields.forEach(field => {
                if (Array.isArray(enrichedProfile[field])) {
                    enrichedProfile[field] = enrichedProfile[field].map((item: any) => ({
                        ...item,
                        id: item.id || generateId()
                    }));
                }
            });

            const newProfile = {
                ...profile,
                ...enrichedProfile,
                personal: { ...profile.personal, ...enrichedProfile.personal },
                // Arrays are replaced, not concatenated, to avoid duplicates on re-import
                // Unless we want to be smarter. For "Resume Import", replacement is usually expected.
            };

            // 3. Merge and Enrich...
            // ... (keeping existing logic, just adding record at end) ...

            // Save to History
            addImportRecord({
                id: crypto.randomUUID(),
                fileName: file.name,
                fileType: file.type === 'application/pdf' ? 'LinkedIn' : 'Resume', // heuristics
                date: new Date().toISOString(),
                status: 'success'
            });

            loadProfile(newProfile as any);
            setStatus({ type: 'success', message: 'Profile imported successfully! Check the Profile tab.' });

        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || 'Failed to process file.' });
        } finally {
            setIsProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            <header style={{ marginBottom: 'var(--spacing-8)' }}>
                <h2 className="section-title">Import Hub</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Kickstart your Master Profile by importing data from LinkedIn or existing resumes.
                </p>

            </header>

            <div style={{ display: 'grid', gap: 'var(--spacing-6)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

                {/* LinkedIn Card */}
                <section className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
                        <div style={{ padding: '8px', background: '#0077b5', borderRadius: '8px', color: 'white' }}>
                            <Linkedin size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Import from LinkedIn</h3>
                    </div>

                    <ol style={{ paddingLeft: '1.2rem', marginBottom: 'var(--spacing-6)', fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                        <li>Go to your LinkedIn Profile.</li>
                        <li>Click <strong>More</strong> button near your intro.</li>
                        <li>Select <strong>Save to PDF</strong>.</li>
                        <li>Upload that PDF here.</li>
                    </ol>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                    >
                        {isProcessing ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
                        {isProcessing ? 'Processing...' : 'Upload Profile PDF'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".pdf"
                        onChange={handleFileUpload}
                    />
                </section>

                {/* Generic CV Card - uses same logic for now */}
                <section className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
                        <div style={{ padding: '8px', background: 'var(--color-text)', borderRadius: '8px', color: 'var(--color-bg)' }}>
                            <FileText size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Parse Existing CV</h3>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>
                        Have an old resume? Upload it (PDF) and our AI will extract your work history, education, and skills to populate your Master Profile automatically.
                    </p>
                    <button
                        className="btn btn-outline"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                    >
                        <Upload size={20} /> Upload CV (PDF)
                    </button>
                </section>

            </div>

            {/* Import History */}
            {importHistory.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)' }}>
                        <h3 className="section-title" style={{ fontSize: '1.2rem' }}>Import History</h3>
                        <button onClick={clearImportHistory} style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textDecoration: 'underline' }}>Clear History</button>
                    </div>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                                <tr>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>File Name</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Type</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importHistory.map(record => (
                                    <tr key={record.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                                        <td style={{ padding: '12px 16px' }}>{record.fileName}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                background: record.fileType === 'LinkedIn' ? '#e0f2fe' : '#f3f4f6',
                                                color: record.fileType === 'LinkedIn' ? '#0369a1' : '#374151',
                                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'
                                            }}>
                                                {record.fileType === 'LinkedIn' ? <Linkedin size={12} /> : <FileText size={12} />}
                                                {record.fileType}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString()}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle size={14} /> Success
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Status Message */}
            {status && (
                <div style={{
                    marginTop: 'var(--spacing-6)',
                    padding: 'var(--spacing-4)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)',
                    background: status.type === 'error' ? '#FEF2F2' : status.type === 'success' ? '#F0FDF4' : '#EFF6FF',
                    color: status.type === 'error' ? '#991B1B' : status.type === 'success' ? '#166534' : '#1E40AF',
                    border: `1px solid ${status.type === 'error' ? '#FECACA' : status.type === 'success' ? '#BBF7D0' : '#BFDBFE'}`
                }}>
                    {status.type === 'error' ? <AlertCircle size={20} /> : status.type === 'success' ? <CheckCircle size={20} /> : <Loader className="animate-spin" size={20} />}
                    <span>{status.message}</span>
                </div>
            )}


        </div>
    );
};

export default ImportHub;
