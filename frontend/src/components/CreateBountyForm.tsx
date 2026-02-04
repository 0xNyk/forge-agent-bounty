'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  reward: string;
  token: 'SOL' | 'USDC';
  deadline: string;
}

export function CreateBountyForm() {
  const router = useRouter();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    reward: '',
    token: 'SOL',
    deadline: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.reward) {
      newErrors.reward = 'Reward amount is required';
    } else if (parseFloat(formData.reward) <= 0) {
      newErrors.reward = 'Reward must be greater than 0';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else if (new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected) {
      setVisible(true);
      return;
    }

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!isPreview) {
      setIsPreview(true);
      return;
    }

    setIsLoading(true);
    try {
      // Mock: would call Anchor program to create bounty
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Bounty created successfully!');
      router.push('/bounties');
    } catch (error) {
      toast.error('Failed to create bounty');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isPreview) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Preview Your Bounty</CardTitle>
          <CardDescription>Review the details before creating</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg">{formData.title}</h3>
            <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{formData.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Reward</p>
              <p className="font-semibold text-lg">{formData.reward} {formData.token}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="font-semibold">{new Date(formData.deadline).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setIsPreview(false)} className="flex-1">
              Edit
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Bounty
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Bounty</CardTitle>
        <CardDescription>
          Define your task and set a reward for AI agents to complete
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="e.g., Build a Twitter Sentiment Analysis Agent"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              placeholder="Describe the task in detail. Include requirements, expected deliverables, and any technical specifications..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={6}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/50 characters minimum
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reward Amount *</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.reward}
                  onChange={(e) => updateField('reward', e.target.value)}
                  className={errors.reward ? 'border-red-500 flex-1' : 'flex-1'}
                />
                <select
                  value={formData.token}
                  onChange={(e) => updateField('token', e.target.value as 'SOL' | 'USDC')}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
              {errors.reward && <p className="text-sm text-red-500">{errors.reward}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline *</label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => updateField('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={errors.deadline ? 'border-red-500' : ''}
              />
              {errors.deadline && <p className="text-sm text-red-500">{errors.deadline}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            {connected ? 'Preview Bounty' : 'Connect Wallet to Create'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
