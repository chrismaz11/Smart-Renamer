import React, { useState, useEffect } from 'react';
import { CheckCircle, Info, File, Cloud, XCircle } from 'lucide-react';

const FileRenamerInterface = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [rules, setRules] = useState({
        namingPattern: '[Date]_[Original Name]_[Counter]',
        dateFormat: 'YYYY-MM-DD',
        counterStart: 1,
        organizeByDate: true,
        organizeByFileType: true,
        createSubfolders: true,
    });
    const [status, setStatus] = useState('idle'); // idle, previewing, applying, success, error

    const handleFileSelect = async () => {
        const files = await window.electron.openDialog();
        if (files) {
            setSelectedFiles(files.map(path => ({ path })));
        }
    };

    const handleRuleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRules(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePreview = async () => {
        setStatus('previewing');
        const filePaths = selectedFiles.map(f => f.path);
        const previews = await window.electron.getPreview({ files: filePaths, rules });
        setPreviewFiles(previews);
        setStatus('idle');
    };

    const handleApplyChanges = async () => {
        setStatus('applying');
        const filePaths = selectedFiles.map(f => f.path);
        const results = await window.electron.applyChanges({ files: filePaths, rules });
        setStatus(results.every(r => r.success) ? 'success' : 'error');
        // Refresh file list and previews
        setSelectedFiles([]);
        setPreviewFiles([]);
    };

    const handleUndo = async () => {
        const result = await window.electron.undo();
        if (result.success) {
            setStatus('idle');
            alert('Last operation has been undone.');
        } else {
            alert(`Failed to undo: ${result.message}`);
        }
    };

    useEffect(() => {
        if (selectedFiles.length > 0) {
            handlePreview();
        } else {
            setPreviewFiles([]);
        }
    }, [selectedFiles, rules]);

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN: Upload & Selection */}
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">File Renamer & Organizer</h1>
                    <p className="text-gray-500 mt-1">Automatically rename and organize your files.</p>
                </div>

                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleFileSelect}>
                    <div className="bg-blue-100 p-3 rounded-full mb-4">
                        <Cloud className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">Drag & drop files here</p>
                    <p className="text-gray-500 text-sm mb-4">or click to browse</p>
                    <button className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700">Browse Files</button>
                </div>

                {/* Renaming & Organization Rules */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Renaming Rules</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="naming-pattern" className="block text-sm font-medium text-gray-700">Naming Pattern</label>
                            <input type="text" name="namingPattern" id="naming-pattern" value={rules.namingPattern} onChange={handleRuleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="date-format" className="block text-sm font-medium text-gray-700">Date Format</label>
                            <input type="text" name="dateFormat" id="date-format" value={rules.dateFormat} onChange={handleRuleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="counter-start" className="block text-sm font-medium text-gray-700">Counter Start</label>
                            <input type="number" name="counterStart" id="counter-start" value={rules.counterStart} onChange={handleRuleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" name="organizeByDate" id="organize-by-date" checked={rules.organizeByDate} onChange={handleRuleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="organize-by-date" className="ml-2 block text-sm text-gray-900">Organize by Date (Year/Month)</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" name="organizeByFileType" id="organize-by-file-type" checked={rules.organizeByFileType} onChange={handleRuleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="organize-by-file-type" className="ml-2 block text-sm text-gray-900">Organize by File Type</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" name="createSubfolders" id="create-subfolders" checked={rules.createSubfolders} onChange={handleRuleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="create-subfolders" className="ml-2 block text-sm text-gray-900">Create Subfolders Automatically</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Preview Panel */}
            <div className="flex flex-col h-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Preview</h2>
                    {status === 'success' && <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full"><CheckCircle className="w-4 h-4 mr-1.5" />Changes Applied</div>}
                    {status === 'error' && <div className="flex items-center text-red-600 text-sm font-medium bg-red-50 px-3 py-1 rounded-full"><XCircle className="w-4 h-4 mr-1.5" />Error Occurred</div>}
                    {previewFiles.length > 0 && status === 'idle' && <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full"><CheckCircle className="w-4 h-4 mr-1.5" />Ready to apply</div>}
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
                    <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-blue-900">Renaming Pattern Applied</p>
                            <p className="text-sm text-blue-700 mt-1">Format: <span className="font-mono bg-blue-100 px-1 rounded">{rules.namingPattern}</span></p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {previewFiles.length === 0 && <div className="text-center text-gray-500">Select files to see a preview.</div>}
                    {previewFiles.map((file) => (
                        <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="mb-3">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Original</p>
                                <div className="flex items-center text-gray-700">
                                    <File className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="text-sm">{file.original}</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 my-3"></div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-blue-600 uppercase font-semibold mb-1">New Name</p>
                                    <p className="text-sm font-medium text-gray-900">{file.newName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Destination</p>
                                    <span className="text-xs bg-gray-50 p-1.5 rounded font-mono text-gray-600">{file.destination}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                    <button onClick={handleApplyChanges} disabled={previewFiles.length === 0 || status === 'applying'} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md font-medium disabled:bg-blue-300">
                        {status === 'applying' ? 'Applying...' : 'Apply Changes'}
                    </button>
                    <button onClick={handleUndo} className="px-4 py-2.5 rounded-md font-medium text-gray-600 border border-gray-200 hover:bg-gray-50">Undo</button>
                </div>
            </div>
        </div>
    );
};

export default FileRenamerInterface;
