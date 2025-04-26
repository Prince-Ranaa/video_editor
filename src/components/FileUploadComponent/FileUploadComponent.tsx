"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export default function VideoEditingComponent() {
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [frames, setFrames] = useState<string[]>([]); // Store extracted frames

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

    const generateFrame = (videoElement: HTMLVideoElement, time: number) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
            // Set canvas dimensions based on the video
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            videoElement.currentTime = time;
            videoElement.onseeked = () => {
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL();
                setFrames((prevFrames) => [...prevFrames, dataUrl]);
            };
        }
    };

    const extractAllFrames = (videoFile: File) => {
        const videoElement = document.createElement("video");
        videoElement.src = URL.createObjectURL(videoFile);
        videoElement.load();

        videoElement.onloadeddata = () => {
            const totalDuration = videoElement.duration;
            const fps = 25; // Default to 30 FPS if not available

            let currentTime = 0;
            const captureFrame = () => {
                if (currentTime < totalDuration) {
                    generateFrame(videoElement, currentTime);
                    currentTime += 1 / fps; // Increment by 1/FPS to capture the next frame
                    requestAnimationFrame(captureFrame); // Continue capturing frames
                }
            };

            captureFrame();
        };
    };

    useEffect(() => {
        if (latestVideo) {
            setFrames([]); // Clear previous frames when a new video is loaded
            extractAllFrames(latestVideo); // Extract all frames from the latest video
        }
    }, [latestVideo]);

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

            {/* Horizontal Strip for Video Frames */}
            <div className="flex overflow-x-auto ">
                {frames.map((frame, index) => (
                    <div key={index} className="flex flex-col ">
                        <img
                            src={frame}
                            alt={`Frame ${index + 1}`}
                            className="w-32 h-20 object-cover "
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
