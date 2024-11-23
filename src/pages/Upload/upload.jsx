// Importamos el CSS y otros recursos
import axios from 'axios';
import logo from '../../assets/img-upload/logo_reducido_negro.png';
import carrito from '../../assets/img-upload/carrito.png';
import ModalLoading from '../../components/Modals/ModalLoading';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilesDropzone from '../../components/FilesDropzone/FilesDropzone';
const obtenerCategorias = async (setCategorias) => {
    try {
        // Realizar la solicitud GET
        const response = await axios.get('http://localhost:5000/api/categoria');
        
        // Desestructurar y obtener solo los campos "id" y "nombre" de cada publicación
        const categoriasData = response.data.map(categoria => ({
            id: categoria._id,
            nombre: categoria.nombre
        }));

        // Actualizar el estado con los datos filtrados
        setCategorias(categoriasData);
    } catch (error) {
        console.error('Error al obtener las categorias:', error);
    }
};

function Upload() {
    const [categorias, setCategorias] = useState([]);
    const id_emprendimiento="673ec846a9c1f418e3397548"
    const [values, setValues] = useState({
        precio: "",
        descuento: "",
    });
    const[nombre, setNombre] = useState("")
    const[tipo, setTipo] = useState("")
    const[descripcion, setDescripcion] = useState("")
    const [id_categoria, setCategoria] = useState("")
    const[imgfiles, setImgfile] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [nombreError, setNombreError] = useState('');
    const [tipoError, setTipoError] = useState('');
    const [catError, setCatError] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        obtenerCategorias(setCategorias);
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/pages/Upload/upload.css'; // Ruta al archivo CSS
        document.head.appendChild(link);
    
        return () => {
          document.head.removeChild(link); // Elimina el CSS cuando el componente se desmonta
        };
        
    }, []);
    const handleCheckboxChange = (e) => {
        setIsDisabled(e.target.checked); // Habilita o deshabilita el input según el estado del checkbox
        if(e.target.checked){
            setValues({
                precio: "",
                descuento: "",
            });
        }
    };
    const handleGoBack = () => {
        navigate(-1); // Navega a la página anterior
    };
    
    const handleImageChanges = (files) => {
        setImgfile(files)
    };
    
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);
    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'Products'); // Reemplaza con tu preset
        formData.append('cloud_name', 'dgchowyad'); // Reemplaza con tu nombre de cloud
    
        try {
            const response = await axios.post('https://api.cloudinary.com/v1_1/dgchowyad/image/upload', formData);
            return response.data.secure_url;
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        let urls=[""]
        let hasError = false;
        if (!nombre) {
            setNombreError('Este campo es obligatorio');
            hasError=true;
        } else {
            setNombreError('');
        }

        if (!tipo) {
            setTipoError('Este campo es obligatorio');
            hasError=true;
        } else {
            setTipoError('');
        }
        if (!id_categoria) {
            setCatError('Este campo es obligatorio');
            hasError=true;
        } else {
            setCatError('');
        }

        if (hasError) {
            return;
        }
        setIsLoading(true);
        setIsOpen(true);
        if(imgfiles.length>0){
            try {
                const imageUploadPromises = imgfiles.map(file => 
                    handleImageUpload(file) // Retorna una promesa para cada archivo
                );
            
                // Esperamos a que todas las promesas se resuelvan
                urls = await Promise.all(imageUploadPromises);
                console.log(urls)
            }catch (error) {
                console.error('Error al crear publicación:', error);
            }
        }

        const formData = {
            id_emprendimiento,
            nombre,
            tipo,
            precio: parseInt(values.precio, 10) || 0,
            descuento: parseInt(values.descuento, 10) || 0,
            descripcion,
            id_categoria,
            imagenes:urls
        };

        console.log(formData)

        try {
        await axios.post('http://localhost:5000/api/publicacion/crear', formData);
        setIsLoading(false);
        openModal();
        } catch (error) {
        console.error('Error al crear publicación:', error);
        }
    };

    const comprobarNegativo = (e) => {
        const { name, value } = e.target;
    
        // Valida que el valor no sea negativo
        if (value === "" || (Number(value) >= 1 && !isNaN(value))) {
            setValues((prevValues) => ({
            ...prevValues,
            [name]: value, // Actualiza solo el input correspondiente
            }));
        }
    };
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };
    return (
        <div>
            {/* Modal */}
            <ModalLoading isOpen={isOpen} isLoading={isLoading} text={'Se creó la publicación exitosamente'} loadingText={"Creando publicación..."}>
                {!isLoading && <button className='btn btn-success' onClick={closeModal}>Aceptar</button>}
            </ModalLoading>

            {/* Sección Principal */}
            {isVisible && (<main className="main-container">
                <section className="info-general">
                    <h2>Información General</h2>
                    <label>Nombre</label>
                    <input type="text" placeholder="Introducir nombre" onChange={(e) => setNombre(e.target.value)}/>
                    {nombreError && <p className="error-message">{nombreError}</p>}
                    <label>Tipo</label>
                    <select defaultValue="" onChange={(e) => setTipo(e.target.value)}>
                        <option value="" disabled hidden>Seleccione una opción</option>
                        <option value="producto">Producto</option>
                        <option value="servicio">Servicio</option>
                    </select>
                    {tipoError && <p className="error-message">{tipoError}</p>}
                    <label>Descripción</label>
                    <textarea placeholder="..." onChange={(e) => setDescripcion(e.target.value)}/>
                </section>

                <section className="imagen">
                    <h2>Imagen</h2>
                    <div className="image-upload">
                        <FilesDropzone setFile={handleImageChanges}/>
                    </div>
                </section>

                <section className="precios">
                    <h2>Precios</h2>
                    <input type="number" placeholder="Precio base" name='precio' value={values.precio} onChange={comprobarNegativo} disabled={isDisabled}/>
                    <div className="calcContainer">
                        <button onClick={toggleVisibility} className='botonPrecio'>Calcular Precio</button>
                        <label className='labelPrecio'>
                        <input type="checkbox" className='inputPrecio' value={0} checked={isDisabled} onChange={handleCheckboxChange} />
                        <span className='checkPrecio'></span>
                        Precio a convenir
                        </label>
                    </div>
                    <input type="number" placeholder="Porcentaje de descuento (%)" name='descuento' value={values.descuento} onChange={comprobarNegativo} disabled={isDisabled}/>
                </section>

                <section className="categoria">
                    <h2>Categoría</h2>
                    <select onChange={(e) => setCategoria(e.target.value)}>
                        <option>Selecciona una Categoría</option>
                        {categorias.map(categoria => (
                            <option value={categoria.id}>
                                {categoria.nombre}
                            </option>
                ))}
                    </select>
                    {catError && <p className="error-message">{catError}</p>}
                </section>

                <div className="buttons">
                    <button className="save-btn">Guardar como borrador</button>
                    <button className="publish-btn" onClick={handleSubmit}>Publicar ahora</button>
                </div>
            </main>)}
        </div>
    );
}

export default Upload;
