import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts'

import BgImage from '../../assets/otp.svg';
import ApiSignIn from './service';


export function SignIn() {
    const nav = useNavigate();
    const { login } = useAuth();
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        
        // Aplica a máscara
        if (numbers.length <= 2) {
            return `(${numbers}`;
        } else if (numbers.length <= 7) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        } else {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        }
    };

    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setMobile(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('🚀 Iniciando processo de login...');
        console.log('📱 Mobile digitado:', mobile);
        console.log('🔒 Password digitado:', password ? '***' : 'vazio');
        
        if (!mobile.trim()) {
            console.log('❌ Erro: Mobile vazio');
            alert('Por favor, digite seu celular');
            return;
        }
        
        if (!password.trim()) {
            console.log('❌ Erro: Password vazio');
            alert('Por favor, digite sua senha');
            return;
        }

        try {
            setLoading(true);
            console.log('⏳ Loading ativado...');
            
            // Remove formatação do celular para enviar apenas números
            const cleanMobile = mobile.replace(/\D/g, '');
            console.log('🧹 Mobile limpo (sem formatação):', cleanMobile);
            
            const data = {
                mobile: cleanMobile,
                password: password,
                company_id: 1
            };
            
            console.log('📡 Dados que serão enviados para API:', data);
            console.log('🌐 URL da API:', `${import.meta.env.VITE_API_URL}/login`);

            const response = await ApiSignIn.GetToken({ data });
            
            console.log('✅ Resposta da API recebida:', response);
            console.log('👤 Dados do usuário:', response.user);
            console.log('🔑 Token recebido:', response.token ? 'Token presente' : 'Token ausente');
            
            if (response.token) {
                console.log('💾 Salvando dados no contexto...');
                login(response);
                console.log('🎯 Navegando para dashboard...');
                nav("/dashboard");
            } else {
                console.log('❌ Token não encontrado na resposta');
                alert('Erro: Token não recebido');
            }
        } catch (error: any) {
            console.log('💥 Erro capturado:', error);
            console.log('📄 Detalhes do erro:', {
                message: error?.message,
                status: error?.status,
                details: error?.details
            });
            
            const errorMessage = error?.message || 'Erro ao fazer login. Tente novamente.';
            alert(errorMessage);
        } finally {
            setLoading(false);
            console.log('⏹️ Loading desativado');
        }
    };

    return (
        <main className='flex h-screen w-full'>
            <div className='bg-[#F6F6F7] w-full h-full flex items-center justify-center'>
                <img src={BgImage} alt="My SVG" className=' w-[55%] h-[55%]' />
            </div>
            <section className='flex bg-backgroundmax-w-3xl w-full  justify-center items-center'>
                <Card className='w-[360px]'>
                    <CardHeader />
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor='mobile' className='pb-1'>celular</Label>
                                <Input 
                                    id='mobile' 
                                    value={mobile}
                                    onChange={handleMobileChange}
                                    placeholder='(11) 9876-5432' 
                                    className='py-6'
                                    disabled={loading}
                                    maxLength={15}
                                />
                            </div>

                            <div className='mt-7'>
                                <Label htmlFor='password' className='pb-1'>sua senha</Label>
                                <div className='relative'>
                                    <Input 
                                        id='password' 
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder='digite a senha' 
                                        className='py-6 pr-12'
                                        disabled={loading}
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowPassword(!showPassword)}
                                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors'
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className='h-5 w-5' />
                                        ) : (
                                            <Eye className='h-5 w-5' />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <Button 
                                type='submit' 
                                className='mt-9 w-full py-6 bg-[#317CE5] cursor-pointer hover:bg-[#317CE5] hover:bg:opacity-70 '
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>        
            </section>
        </main>
    );
}