"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUploadComponent() {
    const [videoFiles, setVideoFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const videoOnly = acceptedFiles.filter((file) => file.type.startsWith("video/"));
        setVideoFiles(videoOnly); // Only keep the latest batch
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "video/*": [] },
        multiple: false,
    });

    const latestVideo = videoFiles[videoFiles.length - 1];








    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row h-[50vh] gap-4">
                {/* Dropzone */}
                <div
                    {...getRootProps()}
                    className={`flex items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-200 flex-1 shadow-sm ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                        }`}
                >
                    <input {...getInputProps()} />
                    <p className="text-gray-600">
                        {isDragActive
                            ? "Drop the video file here ..."
                            : "Drag & drop a video here, or click to select one"}
                    </p>
                </div>

                {/* Video Preview */}
                {latestVideo && (
                    <div className="flex-1 rounded-xl shadow-md overflow-hidden">
                        <video
                            src={URL.createObjectURL(latestVideo)}
                            controls
                            preload="metadata"
                            className="w-full h-full object-cover rounded-xl"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
