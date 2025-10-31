import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, ExternalLink, BookmarkPlus, Heart, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: string;
  description: string;
  requirements: string[];
  skills: string[];
  platform: string;
  url: string;
  matchScore: number;
}

// Mock job listings - in a real app, this would come from an API
const mockJobListings: JobListing[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$80,000 - $120,000',
    type: 'Full-time',
    postedDate: '2 days ago',
    description: 'We are looking for a passionate Frontend Developer to join our dynamic team...',
    requirements: ['React', 'TypeScript', 'CSS', 'Git'],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    platform: 'LinkedIn',
    url: 'https://linkedin.com/jobs/123',
    matchScore: 95
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$70,000 - $100,000',
    type: 'Full-time',
    postedDate: '1 day ago',
    description: 'Join our fast-growing startup as a Full Stack Developer...',
    requirements: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
    skills: ['JavaScript', 'React', 'Node.js', 'Express'],
    platform: 'Indeed',
    url: 'https://indeed.com/jobs/456',
    matchScore: 88
  },
  {
    id: '3',
    title: 'Software Engineer Intern',
    company: 'BigTech Solutions',
    location: 'New York, NY',
    salary: '$25/hour',
    type: 'Internship',
    postedDate: '3 days ago',
    description: 'Great opportunity for students to gain real-world experience...',
    requirements: ['Python', 'Git', 'Problem Solving'],
    skills: ['Python', 'JavaScript', 'Git', 'Algorithms'],
    platform: 'Glassdoor',
    url: 'https://glassdoor.com/jobs/789',
    matchScore: 82
  },
  {
    id: '4',
    title: 'React Developer',
    company: 'DigitalFlow Agency',
    location: 'Austin, TX',
    salary: '$65,000 - $95,000',
    type: 'Contract',
    postedDate: '5 days ago',
    description: 'We need a skilled React developer for an exciting project...',
    requirements: ['React', 'JavaScript', 'REST APIs', 'Git'],
    skills: ['React', 'JavaScript', 'TypeScript', 'API Integration'],
    platform: 'AngelList',
    url: 'https://angellist.com/jobs/101',
    matchScore: 90
  },
  {
    id: '5',
    title: 'Junior Web Developer',
    company: 'Creative Studios',
    location: 'Los Angeles, CA',
    salary: '$55,000 - $75,000',
    type: 'Full-time',
    postedDate: '1 week ago',
    description: 'Perfect entry-level position for new graduates...',
    requirements: ['HTML', 'CSS', 'JavaScript', 'Portfolio'],
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    platform: 'ZipRecruiter',
    url: 'https://ziprecruiter.com/jobs/202',
    matchScore: 75
  }
];

export default function StudentJobApplicationsPage() {
  const { user } = useAuth();
  const [jobListings, setJobListings] = useState<JobListing[]>(mockJobListings);
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>(mockJobListings);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    // Filter jobs based on search and filters
    let filtered = jobListings;

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(job => {
        if (locationFilter === 'remote') {
          return job.location.toLowerCase().includes('remote');
        }
        return job.location.toLowerCase().includes(locationFilter.toLowerCase());
      });
    }

    if (jobTypeFilter !== 'all') {
      filtered = filtered.filter(job => job.type.toLowerCase() === jobTypeFilter.toLowerCase());
    }

    // Sort by match score
    filtered.sort((a, b) => b.matchScore - a.matchScore);

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, jobTypeFilter, jobListings]);

  const handleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return '💼';
      case 'indeed':
        return '🔍';
      case 'glassdoor':
        return '🏢';
      case 'angellist':
        return '👼';
      case 'ziprecruiter':
        return '📮';
      default:
        return '💻';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Applications</h1>
            <p className="text-muted-foreground">
              Discover opportunities tailored to your skills and education
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredJobs.length} jobs found
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs by title, company, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="california">California</SelectItem>
                  <SelectItem value="new york">New York</SelectItem>
                  <SelectItem value="texas">Texas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Listings */}
      <div className="grid gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="glass-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <Badge 
                      className={`${getMatchScoreColor(job.matchScore)} text-white`}
                    >
                      {job.matchScore}% match
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.postedDate}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPlatformIcon(job.platform)}</span>
                  <Badge variant="outline">{job.platform}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant="secondary">{job.type}</Badge>
              </div>
              
              <p className="text-muted-foreground">{job.description}</p>
              
              <div>
                <h4 className="font-medium mb-2">Required Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveJob(job.id)}
                    className={savedJobs.includes(job.id) ? 'bg-red-50 text-red-600 hover:bg-red-100' : ''}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                    {savedJobs.includes(job.id) ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Apply Later
                  </Button>
                </div>
                <Button asChild>
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Job
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}