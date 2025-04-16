export function useTemplates() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const fetchTemplates = async () => {
      // Implémentation existante...
    };
    
    const saveTemplate = async (template: Partial<Template>, id?: string) => {
      // Logique de handleSave actuelle...
    };
    
    const deleteTemplate = async (id: string) => {
      // Logique de handleDelete actuelle...
    };
    
    const sendTestEmail = async (template: Template) => {
      // Logique de handleTestEmail actuelle...
    };
    
    useEffect(() => {
      if (user) fetchTemplates();
    }, [user]);
    
    return {
      templates,
      loading,
      error,
      setError,
      fetchTemplates,
      saveTemplate,
      deleteTemplate,
      sendTestEmail
    };
  }