import { useState, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { useContract } from '../hooks/useContract';
import confetti from 'canvas-confetti';
import { FaLock, FaFileAlt, FaFont, FaStar, FaEye } from 'react-icons/fa';
import Avatar, { AvatarStage } from './ui/Avatar';

interface AddMilestoneFormProps {
  onSuccess: () => void;
  currentAvatarStage: AvatarStage;
  milestonesCount: number;
}

const AddMilestoneForm = ({ onSuccess, currentAvatarStage, milestonesCount = 0 }: AddMilestoneFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proof, setProof] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proofType, setProofType] = useState<'text' | 'file'>('text');
  const [showPreview, setShowPreview] = useState(false);
  const [hashingProgress, setHashingProgress] = useState(0);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  const { addMilestone, calculateHash } = useContract();
  
  // Calculate the next avatar stage based on current milestones
  const getNextAvatarStage = (): AvatarStage => {
    const nextMilestoneCount = milestonesCount + 1;
    
    if (nextMilestoneCount >= 3) {
      return AvatarStage.VIVID;
    } else if (nextMilestoneCount >= 1) {
      return AvatarStage.COLOR;
    }
    
    return currentAvatarStage;
  };
  
  // Simulate progress during hashing
  useEffect(() => {
    let interval: number;
    
    if (isSubmitting && hashingProgress < 100) {
      interval = window.setInterval(() => {
        setHashingProgress(prev => Math.min(prev + 10, 100));
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSubmitting, hashingProgress]);
  
  // Reset form after successful submission with a delay for feedback
  useEffect(() => {
    let timeout: number;
    
    if (submissionSuccess) {
      timeout = window.setTimeout(() => {
        setTitle('');
        setDescription('');
        setProof('');
        setFile(null);
        setSubmissionSuccess(false);
        onSuccess();
      }, 3000);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [submissionSuccess, onSuccess]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      setError('Please enter a milestone title');
      return;
    }
    
    if (proofType === 'text' && !proof) {
      setError('Please provide text as proof');
      return;
    }
    
    if (proofType === 'file' && !file) {
      setError('Please upload a file as proof');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setHashingProgress(0);
      
      // Calculate hash from text or file
      const proofHash = await calculateHash(file || proof);
      
      // Add milestone to blockchain with description
      await addMilestone(title, proofHash, description);
      
      // Show success animation
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Set success state for feedback
      setSubmissionSuccess(true);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Failed to add milestone:', err);
      setError(err.message || 'Failed to add milestone');
      setIsSubmitting(false);
      setHashingProgress(0);
    }
  };
  
  return (
    <Card className="backdrop-blur-sm bg-opacity-60 border-gray-700 shadow-xl">
      {submissionSuccess ? (
        <div className="text-center py-8 px-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaStar className="text-green-400 text-3xl animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-primary-300 to-purple-300 text-transparent bg-clip-text">
            Milestone Added!
          </h2>
          <p className="text-gray-300 mb-6">
            Your achievement has been permanently recorded on the blockchain.
          </p>
          <div className="flex justify-center">
            <div className="relative transition-all duration-1000 scale-110">
              <Avatar stage={getNextAvatarStage()} size="lg" />
              <div className="absolute inset-0 bg-white/30 rounded-full animate-ping-slow"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-primary-300 to-purple-300 text-transparent bg-clip-text">
            Add New Milestone
          </h2>
          
          {showPreview ? (
            <div className="mb-6 p-4 bg-gray-800/80 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg text-primary-200">Avatar Preview</h3>
                <button 
                  type="button" 
                  className="text-gray-400 hover:text-white text-sm"
                  onClick={() => setShowPreview(false)}
                >
                  Back to Form
                </button>
              </div>
              
              <div className="flex gap-8 items-center">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2">Current</p>
                  <Avatar stage={currentAvatarStage} size="md" />
                </div>
                
                <div className="text-gray-400">→</div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2">After</p>
                  <Avatar stage={getNextAvatarStage()} size="md" />
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                <p>Adding this milestone will {getNextAvatarStage() > currentAvatarStage ? 
                  'evolve your avatar to the next stage!' : 
                  'bring you closer to evolving your avatar.'}
                </p>
                <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((milestonesCount + 1) / 4) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Completed EasyA Challenge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Share details about this achievement..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Verification Proof
                </label>
                
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    className={`flex items-center px-3 py-2 rounded-lg text-sm gap-2 ${proofType === 'text' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setProofType('text')}
                  >
                    <FaFont /> Text Description
                  </button>
                  <button
                    type="button"
                    className={`flex items-center px-3 py-2 rounded-lg text-sm gap-2 ${proofType === 'file' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setProofType('file')}
                  >
                    <FaFileAlt /> Upload File
                  </button>
                </div>
                
                {proofType === 'text' ? (
                  <textarea
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter text that proves you completed this milestone"
                    rows={4}
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                  />
                ) : (
                  <div className="w-full">
                    {!file ? (
                      <div 
                        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <FaFileAlt className="mx-auto text-3xl text-gray-400 mb-2" />
                        <p className="text-gray-400">Click to select a file</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, image, or document</p>
                      </div>
                    ) : (
                      <div className="flex items-center p-4 rounded-lg bg-gray-800 border border-gray-700">
                        <FaFileAlt className="text-primary-400 mr-3" />
                        <div className="flex-1 truncate text-gray-200">{file.name}</div>
                        <button
                          type="button"
                          className="ml-2 text-gray-400 hover:text-white"
                          onClick={() => setFile(null)}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    />
                  </div>
                )}
                
                <div className="mt-2 flex items-start bg-gray-800/50 rounded-lg p-3">
                  <FaLock className="text-primary-400 mt-1 mr-2 flex-shrink-0" />
                  <p className="text-xs text-gray-400">
                    We'll create a secure SHA-256 hash of your {proofType} as immutable proof of your achievement. 
                    This ensures your milestone is verifiable on-chain while keeping the details private.
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                >
                  <FaEye /> Preview Avatar Evolution
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}
              
              {isSubmitting && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Generating hash</span>
                    <span className="text-xs text-gray-400">{hashingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 h-2 rounded-full">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${hashingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                variant="gradient"
                fullWidth
                disabled={isSubmitting}
                className="mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Recording on Blockchain...
                  </span>
                ) : (
                  "Add Milestone"
                )}
              </Button>
            </form>
          )}
        </>
      )}
    </Card>
  );
};

export default AddMilestoneForm; 